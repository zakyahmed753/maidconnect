const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { Payment, Notification } = require('../models/index');
const Maid = require('../models/Maid');
const { HouseWife } = require('../models/index');

// ── EGP conversion rate (update as needed) ──
const USD_TO_EGP = 49;

// ── Subscription prices in EGP ──
const PRICES = {
  subscription_monthly: Math.round(9 * USD_TO_EGP),   // ~441 EGP
  subscription_annual:  Math.round(79 * USD_TO_EGP),  // ~3871 EGP
};

const COMMISSION_RATE = 0.20; // 20%

// ─────────────────────────────────────────────
// 1. FAWRY PAYMENT
// ─────────────────────────────────────────────
exports.initFawry = async (req, res) => {
  try {
    const { type, plan, maidProfileId, chatId } = req.body;
    const merchantRefNum = uuidv4();

    let amount, description;
    if (type === 'subscription') {
      amount = PRICES[`subscription_${plan}`];
      description = `MaidConnect ${plan} subscription`;
    } else if (type === 'commission') {
      const maid = await Maid.findById(maidProfileId);
      amount = Math.round(maid.expectedSalary * USD_TO_EGP * COMMISSION_RATE);
      description = `Hiring commission for ${maid.fullName}`;
    }

    // Create pending payment record
    const payment = await Payment.create({
      user: req.user._id, type, method: 'fawry',
      amount, currency: 'EGP',
      amountUSD: Math.round(amount / USD_TO_EGP),
      maidProfile: maidProfileId, hireRef: chatId,
      subscriptionPlan: plan, merchantRefNum,
      commissionRate: type === 'commission' ? COMMISSION_RATE * 100 : null,
    });

    // Build Fawry signature
    // Signature = MD5(merchantCode + merchantRefNum + customerProfileId + returnUrl + amount + securityKey)
    const signatureStr = `${process.env.FAWRY_MERCHANT_CODE}${merchantRefNum}${req.user._id}${amount.toFixed(2)}${process.env.FAWRY_SECURITY_KEY}`;
    const signature = crypto.createHash('md5').update(signatureStr).digest('hex');

    const fawryPayload = {
      merchantCode:      process.env.FAWRY_MERCHANT_CODE,
      merchantRefNum,
      customerProfileId: req.user._id.toString(),
      customerEmail:     req.user.email,
      paymentMethod:     'PayAtFawry', // or 'CARD', 'VALU', etc.
      amount:            amount.toFixed(2),
      currencyCode:      'EGP',
      language:          'ar-eg',
      chargeItems: [{
        itemId:      payment._id.toString(),
        description,
        price:       amount.toFixed(2),
        quantity:    1
      }],
      signature,
      returnUrl: `${process.env.FRONTEND_URL}/payment/callback`,
      authCaptureModePayment: false
    };

    const fawryRes = await axios.post(
      `${process.env.FAWRY_BASE_URL}/charge/request`,
      fawryPayload
    );

    await Payment.findByIdAndUpdate(payment._id, {
      gatewayRef: fawryRes.data.referenceNumber,
      fawryRefNum: fawryRes.data.referenceNumber,
      gatewayResponse: fawryRes.data
    });

    res.json({
      success: true,
      paymentId: payment._id,
      fawryRefNum: fawryRes.data.referenceNumber,
      amount, currency: 'EGP',
      message: 'Pay at any Fawry outlet using this reference number'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// 2. VODAFONE CASH
// ─────────────────────────────────────────────
exports.initVodafoneCash = async (req, res) => {
  try {
    const { type, plan, maidProfileId, chatId, phoneNumber } = req.body;
    const merchantRefNum = uuidv4();

    let amount;
    if (type === 'subscription') {
      amount = PRICES[`subscription_${plan}`];
    } else {
      const maid = await Maid.findById(maidProfileId);
      amount = Math.round(maid.expectedSalary * USD_TO_EGP * COMMISSION_RATE);
    }

    const payment = await Payment.create({
      user: req.user._id, type, method: 'vodafone_cash',
      amount, currency: 'EGP', amountUSD: Math.round(amount / USD_TO_EGP),
      maidProfile: maidProfileId, hireRef: chatId,
      subscriptionPlan: plan, merchantRefNum
    });

    // Vodafone Cash API call
    const vcRes = await axios.post(`${process.env.VODAFONE_BASE_URL}/payment/initiate`, {
      merchantId:       process.env.VODAFONE_MERCHANT_ID,
      merchantPassword: process.env.VODAFONE_MERCHANT_PASSWORD,
      amount:           amount.toString(),
      merchantRefNum,
      msisdn:           phoneNumber,  // customer vodafone number
      lang:             'ar',
      returnUrl:        `${process.env.FRONTEND_URL}/payment/callback`
    });

    await Payment.findByIdAndUpdate(payment._id, {
      gatewayRef: vcRes.data.transactionId,
      gatewayResponse: vcRes.data
    });

    res.json({
      success: true,
      paymentId: payment._id,
      transactionId: vcRes.data.transactionId,
      redirectUrl: vcRes.data.redirectUrl,
      amount, currency: 'EGP'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// 3. INSTAPAY
// ─────────────────────────────────────────────
exports.initInstaPay = async (req, res) => {
  try {
    const { type, plan, maidProfileId, chatId } = req.body;
    const merchantRefNum = uuidv4();

    let amount;
    if (type === 'subscription') {
      amount = PRICES[`subscription_${plan}`];
    } else {
      const maid = await Maid.findById(maidProfileId);
      amount = Math.round(maid.expectedSalary * USD_TO_EGP * COMMISSION_RATE);
    }

    const payment = await Payment.create({
      user: req.user._id, type, method: 'instapay',
      amount, currency: 'EGP', amountUSD: Math.round(amount / USD_TO_EGP),
      maidProfile: maidProfileId, hireRef: chatId,
      subscriptionPlan: plan, merchantRefNum
    });

    const ipRes = await axios.post(`${process.env.INSTAPAY_BASE_URL}/payment/create`, {
      apiKey:      process.env.INSTAPAY_API_KEY,
      amount:      amount / 100, // InstaPay uses pounds
      currency:    'EGP',
      referenceId: merchantRefNum,
      description: `MaidConnect ${type}`,
      callbackUrl: `${process.env.FRONTEND_URL}/payment/callback`,
      customerEmail: req.user.email
    }, {
      headers: { Authorization: `Bearer ${process.env.INSTAPAY_API_KEY}` }
    });

    await Payment.findByIdAndUpdate(payment._id, {
      gatewayRef: ipRes.data.paymentId,
      gatewayResponse: ipRes.data
    });

    res.json({
      success: true,
      paymentId: payment._id,
      paymentUrl: ipRes.data.paymentUrl,
      amount, currency: 'EGP'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// 4. AMAZON PAY
// ─────────────────────────────────────────────
exports.initAmazonPay = async (req, res) => {
  try {
    const { type, plan, maidProfileId, chatId } = req.body;
    const merchantRefNum = uuidv4();

    let amount;
    if (type === 'subscription') {
      amount = PRICES[`subscription_${plan}`];
    } else {
      const maid = await Maid.findById(maidProfileId);
      amount = Math.round(maid.expectedSalary * USD_TO_EGP * COMMISSION_RATE);
    }

    const payment = await Payment.create({
      user: req.user._id, type, method: 'amazon_pay',
      amount, currency: 'EGP', amountUSD: Math.round(amount / USD_TO_EGP),
      maidProfile: maidProfileId, hireRef: chatId,
      subscriptionPlan: plan, merchantRefNum
    });

    // Amazon Pay Create Charge Permission
    const amzRes = await axios.post(
      `https://pay-api.amazon.${process.env.AMAZON_PAY_REGION}/v2/chargePermissions`,
      {
        webCheckoutDetails: {
          checkoutReviewReturnUrl: `${process.env.FRONTEND_URL}/payment/callback`,
          checkoutResultReturnUrl: `${process.env.FRONTEND_URL}/payment/result`
        },
        storeId: process.env.AMAZON_PAY_MERCHANT_ID,
        chargeAmount: { amount: (amount / 100).toFixed(2), currencyCode: 'EGP' },
        merchantMetadata: { merchantReferenceId: merchantRefNum }
      },
      {
        headers: {
          'x-amz-pay-Idempotency-Key': merchantRefNum,
          Authorization: `Bearer ${process.env.AMAZON_PAY_ACCESS_KEY}`
        }
      }
    );

    await Payment.findByIdAndUpdate(payment._id, {
      gatewayRef: amzRes.data.chargePermissionId,
      gatewayResponse: amzRes.data
    });

    res.json({
      success: true,
      paymentId: payment._id,
      amazonPayUrl: amzRes.data.webCheckoutDetails?.amazonPayRedirectUrl,
      amount, currency: 'EGP'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// 5. PAYMENT CALLBACK / WEBHOOK
// ─────────────────────────────────────────────
exports.paymentCallback = async (req, res) => {
  try {
    const { merchantRefNum, paymentStatus, referenceNumber } = req.body;

    const payment = await Payment.findOne({ merchantRefNum });
    if (!payment) return res.status(404).json({ success: false });

    if (paymentStatus === 'PAID' || paymentStatus === 'success' || paymentStatus === 'COMPLETED') {
      payment.status = 'completed';
      payment.paidAt = Date.now();
      payment.gatewayRef = referenceNumber || payment.gatewayRef;
      await payment.save();

      // Activate subscription or confirm hire
      await handlePaymentSuccess(payment);
    } else {
      payment.status = 'failed';
      await payment.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

async function handlePaymentSuccess(payment) {
  if (payment.type === 'subscription') {
    const now = new Date();
    const endDate = new Date(now);
    if (payment.subscriptionPlan === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    await Maid.findOneAndUpdate({ user: payment.user }, {
      'subscription.plan': payment.subscriptionPlan,
      'subscription.status': 'active',
      'subscription.startDate': now,
      'subscription.endDate': endDate,
      'subscription.paymentId': payment._id
    });
    await Notification.create({
      user: payment.user, type: 'subscription',
      title: '🎉 Subscription Activated!',
      body: `Your ${payment.subscriptionPlan} subscription is now active.`
    });
  } else if (payment.type === 'commission') {
    // Mark maid as hired
    const { HouseWife, Chat } = require('../models/index');
    const hw = await HouseWife.findOne({ user: payment.user });
    if (hw && payment.maidProfile) {
      hw.hiredMaids.push({
        maid: payment.maidProfile,
        commissionPaid: true,
        commissionAmount: payment.amount
      });
      await hw.save();
    }
    if (payment.hireRef) {
      await Chat.findByIdAndUpdate(payment.hireRef, { approvalStatus: 'hired' });
    }
    await Notification.create({
      user: payment.user, type: 'hire_confirmed',
      title: '🎉 Hire Confirmed!',
      body: 'Commission paid. The maid has been officially hired!'
    });
  }
}

// ── Get Payment History ──
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

// ── Check Payment Status ──
exports.checkStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment || !payment.user.equals(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json({ success: true, status: payment.status, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
