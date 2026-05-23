const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { Payment, Notification } = require('../models/index');
const Maid = require('../models/Maid');

const PAYMOB_BASE = 'https://accept.paymob.com/api';

// Prices in piasters (EGP × 100) — Paymob requires piasters
const PRICES = {
  subscription_monthly: 44100,  // 441 EGP
  subscription_annual:  387100, // 3871 EGP
};
const COMMISSION_RATE = 0.20;

// ── Paymob 3-step auth flow ──
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
    const { type, plan, maidProfileId, chatId } = req.body;
    const merchantOrderId = uuidv4();

    let amountCents, description;
    if (type === 'subscription') {
      amountCents = PRICES[`subscription_${plan}`];
      description = `Servix ${plan} subscription`;
    } else if (type === 'commission') {
      const maid = await Maid.findById(maidProfileId);
      if (!maid) return res.status(404).json({ success: false, message: 'Maid not found' });
      amountCents = Math.round(maid.expectedSalary * COMMISSION_RATE * 100);
      description = `Commission for ${maid.fullName}`;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment type' });
    }

    const payment = await Payment.create({
      user: req.user._id,
      type,
      method: 'paymob',
      amount: amountCents / 100,
      currency: 'EGP',
      maidProfile: maidProfileId || null,
      hireRef: chatId || null,
      subscriptionPlan: plan || null,
      merchantRefNum: merchantOrderId,
      commissionRate: type === 'commission' ? COMMISSION_RATE * 100 : null,
    });

    const billingData = {
      first_name:      (req.user.name || 'Customer').split(' ')[0],
      last_name:       (req.user.name || 'User').split(' ')[1] || 'User',
      email:           req.user.email,
      phone_number:    req.user.phone || '+20000000000',
      apartment:       'NA', floor: 'NA', street: 'NA',
      building:        'NA', shipping_method: 'NA',
      postal_code:     'NA', city: 'Cairo',
      country:         'EG', state: 'Cairo',
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
    // Verify HMAC if secret is configured
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
    if (payment.subscriptionPlan === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    await Maid.findOneAndUpdate({ user: payment.user }, {
      'subscription.plan':      payment.subscriptionPlan,
      'subscription.status':    'active',
      'subscription.startDate': now,
      'subscription.endDate':   endDate,
      'subscription.paymentId': payment._id,
    });
    await Notification.create({
      user: payment.user, type: 'subscription',
      title: '🎉 Subscription Activated!',
      body: `Your ${payment.subscriptionPlan} subscription is now active.`,
    });
  } else if (payment.type === 'commission') {
    const { HouseWife, Chat } = require('../models/index');
    const hw = await HouseWife.findOne({ user: payment.user });
    if (hw && payment.maidProfile) {
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
      body: 'Commission paid. The maid has been officially hired!',
    });
  }
}

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

// ── Check individual payment status ──
// If still pending, actively query Paymob to get the real result
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
      } catch {
        // Paymob query failed — return whatever we have in DB
      }
    }

    res.json({ success: true, status: payment.status, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
