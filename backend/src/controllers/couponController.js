const crypto = require('crypto');
const Maid = require('../models/Maid');
const { Coupon, Notification } = require('../models/index');

const REFERRAL_DISCOUNT_PCT = 15;

function makeCode(name = '') {
  const prefix = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'X');
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}${suffix}`;
}

// ─── GET /api/coupons/my-code ───
exports.getMyCode = async (req, res) => {
  try {
    let maid = await Maid.findOne({ user: req.user._id });
    if (!maid) return res.status(404).json({ success: false, message: 'Maid profile not found' });

    if (!maid.referralCode) {
      let code, collision = true;
      while (collision) {
        code = makeCode(maid.fullName);
        collision = await Maid.findOne({ referralCode: code });
      }
      maid.referralCode = code;
      await maid.save();
    }

    res.json({
      success: true,
      referralCode: maid.referralCode,
      referralCount: maid.referralCount || 0,
      referralCredit: maid.referralCredit || 0,
      discountOffered: REFERRAL_DISCOUNT_PCT,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/coupons/validate ───
exports.validateCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code || !amount) return res.status(400).json({ success: false, message: 'code and amount required' });

    const normalised = code.trim().toUpperCase();

    // 1. Check admin coupons first
    const adminCoupon = await Coupon.findOne({ code: normalised, type: 'admin', isActive: true });
    if (adminCoupon) {
      if (adminCoupon.expiresAt && adminCoupon.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: 'This coupon has expired' });
      }
      if (adminCoupon.maxUses !== null && adminCoupon.usesCount >= adminCoupon.maxUses) {
        return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
      }
      if (adminCoupon.usedBy.some(id => String(id) === String(req.user._id))) {
        return res.status(400).json({ success: false, message: 'You have already used this coupon' });
      }

      const discountAmount = adminCoupon.discountType === 'percentage'
        ? Math.round(amount * adminCoupon.discountValue / 100)
        : Math.min(adminCoupon.discountValue, amount);

      return res.json({
        success: true,
        valid: true,
        couponType: 'admin',
        discountType: adminCoupon.discountType,
        discountValue: adminCoupon.discountValue,
        discountAmount,
        finalAmount: Math.max(1, amount - discountAmount),
      });
    }

    // 2. Check maid referral codes
    const referrer = await Maid.findOne({ referralCode: normalised });
    if (referrer) {
      if (String(referrer.user) === String(req.user._id)) {
        return res.status(400).json({ success: false, message: 'You cannot use your own referral code' });
      }
      const discountAmount = Math.round(amount * REFERRAL_DISCOUNT_PCT / 100);
      return res.json({
        success: true,
        valid: true,
        couponType: 'referral',
        referrerId: referrer._id,
        discountType: 'percentage',
        discountValue: REFERRAL_DISCOUNT_PCT,
        discountAmount,
        finalAmount: Math.max(1, amount - discountAmount),
      });
    }

    return res.status(400).json({ success: false, valid: false, message: 'Invalid coupon code' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: POST /api/coupons ───
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, maxUses, expiresAt } = req.body;
    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ success: false, message: 'code, discountType, discountValue are required' });
    }
    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      type: 'admin',
      discountType,
      discountValue: Number(discountValue),
      maxUses: maxUses ? Number(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: GET /api/coupons ───
exports.listCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: PUT /api/coupons/:id/toggle ───
exports.toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Called by paymentController during initiation to compute discount (no side-effects)
exports.applyDiscount = async (userId, couponCode, amountEGP) => {
  const normalised = couponCode.trim().toUpperCase();

  const adminCoupon = await Coupon.findOne({ code: normalised, type: 'admin', isActive: true });
  if (adminCoupon) {
    if (adminCoupon.expiresAt && adminCoupon.expiresAt < new Date()) return { valid: false };
    if (adminCoupon.maxUses !== null && adminCoupon.usesCount >= adminCoupon.maxUses) return { valid: false };
    if (adminCoupon.usedBy.some(id => String(id) === String(userId))) return { valid: false };
    const discountAmount = adminCoupon.discountType === 'percentage'
      ? Math.round(amountEGP * adminCoupon.discountValue / 100)
      : Math.min(adminCoupon.discountValue, amountEGP);
    return { valid: true, discountAmount };
  }

  const referrer = await Maid.findOne({ referralCode: normalised });
  if (referrer && String(referrer.user) !== String(userId)) {
    const discountAmount = Math.round(amountEGP * REFERRAL_DISCOUNT_PCT / 100);
    return { valid: true, discountAmount };
  }

  return { valid: false };
};

// Called by paymentController after successful subscription payment
exports.applyUsage = async (userId, couponCode, amount) => {
  if (!couponCode) return;
  const normalised = couponCode.trim().toUpperCase();

  // Admin coupon usage
  const adminCoupon = await Coupon.findOne({ code: normalised, type: 'admin' });
  if (adminCoupon) {
    await Coupon.findByIdAndUpdate(adminCoupon._id, {
      $addToSet: { usedBy: userId },
      $inc: { usesCount: 1 },
    });
    return;
  }

  // Referral code usage — notify + increment referrer
  const referrer = await Maid.findOne({ referralCode: normalised });
  if (referrer) {
    await Maid.findByIdAndUpdate(referrer._id, { $inc: { referralCount: 1 } });
    await Notification.create({
      user: referrer.user,
      type: 'system',
      title: '🎉 Referral Bonus!',
      body: `A new maid subscribed using your referral code. You've earned a referral credit!`,
    });
  }
};
