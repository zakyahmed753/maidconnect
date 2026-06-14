const crypto = require('crypto');
const axios  = require('axios');
const { v4: uuidv4 } = require('uuid');
const { Payment, Notification, HouseWife } = require('../models/index');
const Maid = require('../models/Maid');

const PAYMOB_BASE = 'https://accept.paymob.com/api';

// Nationality → monthly piasters
function getMaidPriceCents(nationality = '') {
  const n = nationality.toLowerCase();
  if (n.includes('philip') || n.includes('filip')) return 100000; // 1000 EGP
  if (n.includes('indonesia') || n.includes('ethiopia')) return 80000; // 800 EGP
  return 50000; // 500 EGP
}

const CUSTOMER_SUBSCRIPTION_CENTS = 100000; // 1000 EGP
const COMMISSION_RATE = 0.20;

async function paymobAuth() {
  const res = await axios.post(`${PAYMOB_BASE}/auth/tokens`, {
    api_key: process.env.PAYMOB_API_KEY,
  });
  return res.data.token;
}

async function createPaymobOrder(authToken, amountCents, merchantOrderId) {
  const res = await axios.post(`${PAYMOB_BASE}/ecommerce/orders`, {
    auth_token: authToken,
    delivery_needed: false,
    amount_cents: amountCents,
    currency: 'EGP',
    merchant_order_id: merchantOrderId,
    items: [],
  });
  return res.data.id;
}

async function createPaymentKey(authToken, orderId, amountCents, billingData) {
  const res = await axios.post(`${PAYMOB_BASE}/acceptance/payment_keys`, {
    auth_token: authToken,
    amount_cents: amountCents,
    expiration: 3600,
    order_id: orderId,
    billing_data: billingData,
    currency: 'EGP',
    integration_id: parseInt(process.env.PAYMOB_INTEGRATION_ID),
    lock_order_when_paid: false,
  });
  return res.data.token;
}

// ─────────────────────────────────────────────
// INITIATE PAYMOB PAYMENT
// POST /api/payments/paymob/initiate
// ─────────────────────────────────────────────
exports.initiatePaymob = async (req, res) => {
  try {
    const { type, plan, maidProfileId, chatId, couponCode } = req.body;
    const merchantOrderId = uuidv4();

    let amountCents, description, appliedCouponCode, couponDiscount = 0, referralCreditApplied = 0;

    if (type === 'subscription') {
      // Maid paying for their own subscription
      const maidProfile = await Maid.findOne({ user: req.user._id });
      if (!maidProfile) return res.status(404).json({ success: false, message: 'Maid profile not found' });
      amountCents = getMaidPriceCents(maidProfile.nationality);
      description = `Servix monthly subscription`;

      // Apply coupon discount
      if (couponCode) {
        const { applyDiscount } = require('./couponController');
        const discountResult = await applyDiscount(req.user._id, couponCode.trim().toUpperCase(), amountCents / 100);
        if (discountResult.valid) {
          couponDiscount = discountResult.discountAmount;
          amountCents = Math.max(100, amountCents - couponDiscount * 100);
          appliedCouponCode = couponCode.trim().toUpperCase();
        }
      }

      // Apply referral credit (EGP, no carry-over — always resets to 0 after payment)
      const referralCredit = maidProfile.referralCredit || 0;
      referralCreditApplied = Math.min(referralCredit, Math.floor(amountCents / 100));
      amountCents = Math.max(0, amountCents - referralCreditApplied * 100);

      // If credit fully covers the subscription — activate without going to Paymob
      if (amountCents === 0) {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);
        await Maid.findOneAndUpdate({ user: req.user._id }, {
          'subscription.plan': plan || 'monthly',
          'subscription.status': 'active',
          'subscription.startDate': now,
          'subscription.endDate': endDate,
          referralCredit: 0,
          'monthlyHires.count': 0,
          'monthlyHires.month': now.toISOString().slice(0, 7),
        });
        await Payment.create({
          user: req.user._id, type: 'subscription', method: 'referral_credit',
          amount: 0, status: 'completed', subscriptionPlan: plan || 'monthly',
          referralCreditApplied, paidAt: now,
        });
        await Notification.create({
          user: req.user._id, type: 'subscription',
          title: '🎉 Subscription Activated!',
          body: 'Your monthly subscription is now active — fully covered by your referral credit!',
        });
        return res.json({ success: true, freeViaCredit: true, creditApplied: referralCreditApplied, amount: 0 });
      }

    } else if (type === 'customer_subscription') {
      // Customer/housewife paying for platform access
      amountCents = CUSTOMER_SUBSCRIPTION_CENTS;
      description = 'Servix customer monthly subscription';

    } else if (type === 'commission') {
      const maid = await Maid.findById(maidProfileId);
      if (!maid) return res.status(404).json({ success: false, message: 'Maid not found' });

      const hw = await HouseWife.findOne({ user: req.user._id });
      const vacancyActive = hw?.freeVacancy?.available && hw.freeVacancy.expiresAt > new Date();

      // Safeguard: replacement fee must be paid via /replacement_fee before hiring
      if (vacancyActive && (hw.freeVacancy.penaltyAmount || 0) > 0) {
        return res.status(403).json({
          success: false,
          requiresReplacementFee: true,
          penaltyAmount: hw.freeVacancy.penaltyAmount,
          message: 'Pay your replacement fee before hiring a new maid.',
        });
      }

      if (vacancyActive) {
        // Vacancy active with no penalty (grace period or already paid) — hire for free
        await HouseWife.findOneAndUpdate({ user: req.user._id }, {
          'freeVacancy.available':     false,
          'freeVacancy.penaltyAmount': 0,
          $push: { hiredMaids: { maid: maid._id, commissionPaid: true, commissionAmount: 0 } },
        });
        if (chatId) {
          const { Chat } = require('../models/index');
          await Chat.findByIdAndUpdate(chatId, { approvalStatus: 'hired' });
        }
        await Notification.create({
          user: req.user._id, type: 'hire_confirmed',
          title: '🎉 Hire Confirmed (Free Replacement)!',
          body: `${maid.fullName} has been hired using your free replacement vacancy.`,
        });
        return res.json({ success: true, freeVacancyUsed: true, amount: 0 });
      }

      // No active vacancy — normal commission
      amountCents = Math.round(maid.expectedSalary * COMMISSION_RATE * 100);
      description = `Commission for ${maid.fullName}`;

    } else if (type === 'replacement_fee') {
      const hw = await HouseWife.findOne({ user: req.user._id });
      if (!hw?.freeVacancy?.available) {
        return res.status(400).json({ success: false, message: 'No active vacancy slot found' });
      }
      if (!hw.freeVacancy.penaltyAmount || hw.freeVacancy.penaltyAmount === 0) {
        return res.status(400).json({ success: false, message: 'No replacement fee pending' });
      }
      if (new Date(hw.freeVacancy.expiresAt) < new Date()) {
        return res.status(400).json({ success: false, message: 'Replacement vacancy has expired' });
      }
      amountCents = hw.freeVacancy.penaltyAmount * 100;
      description = `Replacement slot fee (EGP ${hw.freeVacancy.penaltyAmount})`;

    } else {
      return res.status(400).json({ success: false, message: `Invalid payment type: "${type}". Allowed: subscription, customer_subscription, commission, release_fee` });
    }

    const payment = await Payment.create({
      user: req.user._id,
      type,
      method: 'paymob',
      amount: amountCents / 100,
      currency: 'EGP',
      maidProfile: maidProfileId || null,
      hireRef: chatId || null,
      subscriptionPlan: (type === 'subscription' || type === 'customer_subscription') ? 'monthly' : undefined,
      merchantRefNum: merchantOrderId,
      commissionRate: type === 'commission' ? COMMISSION_RATE * 100 : null,
      couponCode: appliedCouponCode || undefined,
      couponDiscount: couponDiscount || 0,
      referralCreditApplied: referralCreditApplied || 0,
    });

    const billingData = {
      first_name:      (req.user.name || 'Customer').split(' ')[0],
      last_name:       (req.user.name || 'User').split(' ')[1] || 'User',
      email:           req.user.email,
      phone_number:    req.user.phone || '+20000000000',
      apartment: 'NA', floor: 'NA', street: 'NA',
      building:  'NA', shipping_method: 'NA',
      postal_code: 'NA', city: 'Cairo', country: 'EG', state: 'Cairo',
    };

    const authToken  = await paymobAuth();
    const orderId    = await createPaymobOrder(authToken, amountCents, merchantOrderId);
    const paymentKey = await createPaymentKey(authToken, orderId, amountCents, billingData);

    await Payment.findByIdAndUpdate(payment._id, {
      gatewayRef: String(orderId),
      gatewayResponse: { paymobOrderId: orderId },
    });

    res.json({
      success: true,
      paymentId: payment._id,
      paymentKey,
      iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`,
      amount: amountCents / 100,
      currency: 'EGP',
      description,
      referralCreditApplied,
    });
  } catch (err) {
    console.error('Paymob initiate error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: err.response?.data?.message || err.message });
  }
};

// ─────────────────────────────────────────────
// PAYMOB WEBHOOK CALLBACK
// POST /api/payments/paymob/callback
// ─────────────────────────────────────────────
exports.paymobCallback = async (req, res) => {
  try {
    if (process.env.PAYMOB_HMAC_SECRET) {
      const { hmac } = req.query;
      const obj = req.body.obj || {};
      const fields = [
        obj.amount_cents, obj.created_at, obj.currency,
        obj.error_occured, obj.has_parent_transaction, obj.id,
        obj.integration_id, obj.is_3d_secure, obj.is_auth,
        obj.is_capture, obj.is_refunded, obj.is_standalone_payment,
        obj.is_voided, obj.order?.id, obj.owner, obj.pending,
        obj.source_data?.pan, obj.source_data?.sub_type,
        obj.source_data?.type, obj.success,
      ];
      const calculated = crypto
        .createHmac('sha512', process.env.PAYMOB_HMAC_SECRET)
        .update(fields.join(''))
        .digest('hex');
      if (calculated !== hmac) {
        return res.status(401).json({ success: false, message: 'Invalid HMAC' });
      }
    }

    const obj = req.body.obj || {};
    const merchantOrderId = obj.order?.merchant_order_id;
    const success = obj.success === true || obj.success === 'true';

    const payment = await Payment.findOne({ merchantRefNum: merchantOrderId });
    if (!payment) return res.status(404).json({ success: false });

    if (success) {
      payment.status = 'completed';
      payment.paidAt = Date.now();
      payment.gatewayRef = String(obj.order?.id || payment.gatewayRef);
      await payment.save();
      await handlePaymentSuccess(payment);
    } else {
      payment.status = 'failed';
      await payment.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Paymob callback error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// SHARED: activate subscription / confirm hire
// ─────────────────────────────────────────────
async function handlePaymentSuccess(payment) {
  if (payment.type === 'subscription') {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);
    await Maid.findOneAndUpdate({ user: payment.user }, {
      'subscription.plan':      'monthly',
      'subscription.status':    'active',
      'subscription.startDate': now,
      'subscription.endDate':   endDate,
      'subscription.paymentId': payment._id,
      'monthlyHires.count':     0,
      'monthlyHires.month':     now.toISOString().slice(0, 7),
    });
    if (payment.couponCode) {
      const { applyUsage } = require('./couponController');
      await applyUsage(payment.user, payment.couponCode, payment.amount);
    }
    // Reset referral credit — no carry-over policy
    await Maid.findOneAndUpdate({ user: payment.user }, { referralCredit: 0 });
    await Notification.create({
      user: payment.user, type: 'subscription',
      title: '🎉 Subscription Activated!',
      body: 'Your monthly subscription is now active.',
    });

  } else if (payment.type === 'customer_subscription') {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);
    await HouseWife.findOneAndUpdate({ user: payment.user }, {
      'subscription.status':    'active',
      'subscription.startDate': now,
      'subscription.endDate':   endDate,
      'subscription.paymentId': payment._id,
    });
    await Notification.create({
      user: payment.user, type: 'subscription',
      title: '🎉 Subscription Activated!',
      body: 'You can now chat with maids and start hiring.',
    });

  } else if (payment.type === 'replacement_fee') {
    // Fee paid — clear the penalty so the customer can chat and hire freely
    await HouseWife.findOneAndUpdate({ user: payment.user }, {
      'freeVacancy.penaltyAmount': 0,
    });
    await Notification.create({
      user: payment.user, type: 'payment',
      title: '✅ Replacement Fee Paid',
      body: 'You can now chat with and hire your next maid.',
    });

  } else if (payment.type === 'commission') {
    const { HouseWife, Chat } = require('../models/index');
    const hw = await HouseWife.findOne({ user: payment.user });
    if (hw && payment.maidProfile) {
      // Clear the free vacancy slot (whether it was a penalized replacement or normal hire)
      if (hw.freeVacancy?.available) {
        hw.freeVacancy.available     = false;
        hw.freeVacancy.penaltyAmount = 0;
      }
      hw.hiredMaids.push({
        maid: payment.maidProfile,
        commissionPaid: true,
        commissionAmount: payment.amount,
      });
      await hw.save();
    }
    if (payment.hireRef) {
      await Chat.findByIdAndUpdate(payment.hireRef, { approvalStatus: 'hired' });
    }
    await Notification.create({
      user: payment.user, type: 'hire_confirmed',
      title: '🎉 Hire Confirmed!',
      body: 'Your new maid has been officially hired!',
    });
  }
}

// ─────────────────────────────────────────────
// RETURN MAID — gives free replacement vacancy
// POST /api/payments/return-maid
// ─────────────────────────────────────────────
exports.returnMaid = async (req, res) => {
  try {
    const { maidProfileId, chatId } = req.body;
    const DAY_MS    = 24 * 60 * 60 * 1000;
    const THREE_DAYS_MS = 3 * DAY_MS;

    const hw = await HouseWife.findOne({ user: req.user._id });
    const hireEntry = hw?.hiredMaids?.find(h => String(h.maid) === String(maidProfileId));
    if (!hireEntry) {
      return res.status(404).json({ success: false, message: 'Maid not in your hired list' });
    }

    // Calculate what the customer will owe when they hire their next maid.
    // Release itself is always free — the fee is charged at next hire time.
    const daysHired = (Date.now() - new Date(hireEntry.hiredAt || 0).getTime()) / DAY_MS;
    let penaltyAmount = 0;
    if      (daysHired > 30) penaltyAmount = 1000;
    else if (daysHired > 7)  penaltyAmount = 700;
    else if (daysHired > 3)  penaltyAmount = 500;

    const expiresAt = new Date(Date.now() + THREE_DAYS_MS);
    await HouseWife.findOneAndUpdate({ user: req.user._id }, {
      'freeVacancy.available':     true,
      'freeVacancy.expiresAt':     expiresAt,
      'freeVacancy.penaltyAmount': penaltyAmount,
      $pull:    { hiredMaids: { maid: maidProfileId } },
      $addToSet:{ blockedMaids: maidProfileId },
      $push:    { pastHiredMaids: { maid: maidProfileId, releasedAt: new Date() } },
    });

    if (maidProfileId) {
      await Maid.findByIdAndUpdate(maidProfileId, { isAvailable: true, isHired: false });
    }

    if (chatId) {
      const { Chat } = require('../models/index');
      await Chat.findByIdAndUpdate(chatId, { approvalStatus: 'chatting', isActive: false });
    } else if (maidProfileId) {
      // No chatId provided — find by participants and deactivate
      const { Chat } = require('../models/index');
      const maidDoc = await Maid.findById(maidProfileId).select('user');
      if (maidDoc) {
        await Chat.updateMany({ housewife: req.user._id, maid: maidDoc.user }, { isActive: false });
      }
    }

    const notifBody = penaltyAmount > 0
      ? `You have 3 days to hire a replacement. A fee of EGP ${penaltyAmount} will apply.`
      : 'You have 3 days to hire a free replacement maid.';

    await Notification.create({
      user: req.user._id, type: 'system',
      title: '↩ Maid Released',
      body: notifBody,
    });

    res.json({ success: true, penaltyAmount, freeVacancyExpiresAt: expiresAt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Payment history ──
exports.getHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('maidProfile', 'fullName photos')
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Check individual payment status (with Paymob verification) ──
exports.checkStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment || !payment.user.equals(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status === 'pending' && payment.gatewayRef) {
      try {
        const authToken = await paymobAuth();
        const orderRes  = await axios.get(
          `${PAYMOB_BASE}/ecommerce/orders/${payment.gatewayRef}`,
          { params: { token: authToken } }
        );
        const order = orderRes.data;
        if (order.paid_amount_cents > 0 || order.is_payment_locked) {
          payment.status = 'completed';
          payment.paidAt = payment.paidAt || Date.now();
          await payment.save();
          await handlePaymentSuccess(payment);
        }
      } catch {}
    }

    res.json({ success: true, status: payment.status, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
