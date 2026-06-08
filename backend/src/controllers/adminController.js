const User = require('../models/User');
const Maid = require('../models/Maid');
const { HouseWife, Payment, Notification, Chat } = require('../models/index');

// ── Dashboard Stats ──
exports.getDashboard = async (req, res) => {
  try {
    const [
      totalMaids, activeMaids, pendingMaids, totalHW,
      totalRevenue, monthlyRev, totalHires, pendingPayments
    ] = await Promise.all([
      Maid.countDocuments(),
      Maid.countDocuments({ approvalStatus: 'approved', 'subscription.status': 'active' }),
      Maid.countDocuments({ approvalStatus: 'pending' }),
      HouseWife.countDocuments(),
      Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: new Date(new Date().setDate(1)) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Chat.countDocuments({ approvalStatus: 'hired' }),
      Payment.countDocuments({ status: 'pending' })
    ]);

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyBreakdown = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Revenue by type
    const revenueByType = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Offline (cash transfer) payments breakdown
    const offlineStats = await Payment.aggregate([
      { $match: { status: 'completed', offlineByAdmin: true } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalMaids, activeMaids, pendingMaids, totalHW,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRev[0]?.total || 0,
        totalHires, pendingPayments,
        monthlyBreakdown, revenueByType,
        offlineRevenue: offlineStats[0]?.total || 0,
        offlineCount: offlineStats[0]?.count || 0,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get All Maids (admin) ──
exports.getAllMaids = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { approvalStatus: status } : {};
    const total = await Maid.countDocuments(filter);
    const maids = await Maid.find(filter)
      .populate('user', 'name email phone createdAt isSuspended')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, maids, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Single Maid (full detail) ──
exports.getMaid = async (req, res) => {
  try {
    const maid = await Maid.findById(req.params.id)
      .populate('user', 'name email phone createdAt isSuspended suspendReason deletedAt');
    if (!maid) return res.status(404).json({ success: false, message: 'Maid not found' });
    // Include any pending offline payment receipt submitted by the maid
    const pendingReceipt = await Payment.findOne({
      maidProfile: maid._id,
      method: 'cash_transfer',
      status: 'pending',
    }).sort({ createdAt: -1 });
    res.json({ success: true, maid, pendingReceipt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Approve / Reject Maid ──
exports.updateMaidStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const update = { approvalStatus: status, approvalNote: note, approvedBy: req.user._id, approvedAt: Date.now() };
    // When admin approves the profile, also mark identity as verified
    if (status === 'approved') {
      update.verificationStatus = 'verified';
      update.verifiedBy = req.user._id;
      update.verifiedAt = new Date();
    }
    const maid = await Maid.findByIdAndUpdate(req.params.id, update, { new: true }).populate('user');

    const notifMessage = {
      approved: { title: '✅ Profile Approved!', body: 'Your profile is now visible to house wives.' },
      rejected: { title: '❌ Profile Rejected', body: `Reason: ${note || 'Does not meet requirements'}` },
      suspended: { title: '⚠️ Profile Suspended', body: `Your profile has been suspended. Reason: ${note}` }
    };

    if (notifMessage[status]) {
      await Notification.create({
        user: maid.user._id, type: 'system',
        ...notifMessage[status]
      });
    }

    res.json({ success: true, maid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Verify / Reject Maid Identity (passport + selfie) ──
exports.verifyIdentity = async (req, res) => {
  try {
    const { status, note } = req.body; // status: 'verified' | 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const maid = await Maid.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status, verificationNote: note, verifiedBy: req.user._id, verifiedAt: new Date() },
      { new: true }
    ).populate('user');
    if (!maid) return res.status(404).json({ success: false, message: 'Maid not found' });

    const msg = status === 'verified'
      ? { title: '✅ Identity Verified!', body: 'Your passport and selfie have been verified. You can now subscribe.' }
      : { title: '❌ Verification Rejected', body: `Reason: ${note || 'Documents did not meet requirements. Please resubmit.'}` };

    await Notification.create({ user: maid.user._id, type: 'system', ...msg });
    res.json({ success: true, maid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Manually Activate Maid Subscription (admin) ──
exports.activateSubscription = async (req, res) => {
  try {
    const { plan = 'monthly' } = req.body;
    const now = new Date();
    const endDate = new Date(now);
    if (plan === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    const maid = await Maid.findByIdAndUpdate(
      req.params.id,
      {
        'subscription.plan': plan,
        'subscription.status': 'active',
        'subscription.startDate': now,
        'subscription.endDate': endDate,
      },
      { new: true }
    ).populate('user');
    if (!maid) return res.status(404).json({ success: false, message: 'Maid not found' });
    await Notification.create({
      user: maid.user._id, type: 'subscription',
      title: '🎉 Subscription Activated!',
      body: `Your ${plan} subscription has been activated by admin.`
    });
    res.json({ success: true, maid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get All HouseWives ──
exports.getAllHouseWives = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await HouseWife.countDocuments();
    const housewives = await HouseWife.find()
      .populate('user', 'name email phone createdAt isSuspended')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, housewives, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Suspend / Unsuspend User ──
exports.toggleSuspend = async (req, res) => {
  try {
    const { isSuspended, reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isSuspended, suspendReason: reason || null },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get All Payments ──
exports.getPayments = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate('user', 'name email')
      .populate('maidProfile', 'fullName nationality')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, payments, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Toggle Maid Hired Status ──
exports.toggleHired = async (req, res) => {
  try {
    const maid = await Maid.findById(req.params.id);
    if (!maid) return res.status(404).json({ success: false, message: 'Maid not found' });
    const newStatus = !maid.isHired;
    await Maid.findByIdAndUpdate(req.params.id, { isHired: newStatus });
    await Notification.create({
      user: maid.user,
      type: 'system',
      title: newStatus ? '💼 Profile Hidden — Hired' : '🟢 Profile Visible Again',
      body: newStatus
        ? 'Your profile has been marked as hired and is temporarily hidden from customers.'
        : 'Your profile is now visible to customers again.'
    });
    res.json({ success: true, isHired: newStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Offline (Cash Transfer) Payment for Maid Subscription ──
exports.offlinePayment = async (req, res) => {
  try {
    const { plan = 'monthly', amount, note } = req.body;
    const maid = await Maid.findById(req.params.id).populate('user');
    if (!maid) return res.status(404).json({ success: false, message: 'Maid not found' });

    const now = new Date();
    const endDate = new Date(now);
    if (plan === 'annual') endDate.setFullYear(endDate.getFullYear() + 1);
    else endDate.setMonth(endDate.getMonth() + 1);

    // Use provided amount or compute by origin
    const originPrices = { philippine: 1000, filipino: 1000, indonesian: 800, ethiopian: 800 };
    const computedAmount = amount || originPrices[(maid.origin || '').toLowerCase()] || 500;

    // Confirm existing maid-submitted receipt if present; otherwise create new record
    let payment = await Payment.findOne({
      maidProfile: maid._id, method: 'cash_transfer', status: 'pending',
    }).sort({ createdAt: -1 });

    if (payment) {
      payment.status = 'completed';
      payment.offlineByAdmin = true;
      payment.adminNote = note || payment.adminNote || 'Confirmed by admin';
      payment.amount = computedAmount;
      payment.subscriptionPlan = plan;
      payment.paidAt = now;
      await payment.save();
    } else {
      payment = await Payment.create({
        user: maid.user._id,
        type: 'subscription',
        method: 'cash_transfer',
        amount: computedAmount,
        status: 'completed',
        offlineByAdmin: true,
        adminNote: note || 'Offline cash payment recorded by admin',
        maidProfile: maid._id,
        subscriptionPlan: plan,
        paidAt: now,
      });
    }

    await Maid.findByIdAndUpdate(req.params.id, {
      'subscription.plan': plan,
      'subscription.status': 'active',
      'subscription.startDate': now,
      'subscription.endDate': endDate,
      'subscription.paymentId': payment._id,
    });

    await Notification.create({
      user: maid.user._id,
      type: 'subscription',
      title: '💵 Subscription Activated!',
      body: `Your ${plan} subscription has been activated via offline cash payment.`,
    });

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Reject Maid Offline Payment Receipt ──
exports.rejectOfflinePayment = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    if (!paymentId) return res.status(400).json({ success: false, message: 'paymentId required' });
    const payment = await Payment.findOneAndUpdate(
      { _id: paymentId, method: 'cash_transfer', status: 'pending' },
      { status: 'failed', adminNote: reason || 'Receipt rejected by admin. Please resubmit a clear payment receipt.' },
      { new: true }
    ).populate('user', 'name email _id');
    if (!payment) return res.status(404).json({ success: false, message: 'Pending payment not found' });
    await Notification.create({
      user: payment.user._id,
      type: 'payment',
      title: '❌ Payment Receipt Rejected',
      body: reason || 'Your receipt was rejected. Please transfer again and upload a clear receipt.',
    });
    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Soft Delete User Account ──
exports.softDeleteUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { deletedAt: new Date(), deletionReason: reason || null },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Restore Soft-Deleted User Account ──
exports.restoreUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { deletedAt: null, deletionReason: null },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await Notification.create({
      user: user._id,
      type: 'system',
      title: '✅ Account Restored',
      body: 'Your account has been reactivated by the admin. You can now log in again.',
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Send Broadcast Notification ──
exports.broadcastNotification = async (req, res) => {
  try {
    const { title, body, targetRole } = req.body;
    const filter = targetRole ? { role: targetRole } : {};
    const users = await User.find(filter).select('_id');

    const notifications = users.map(u => ({ user: u._id, type: 'system', title, body }));
    await Notification.insertMany(notifications);

    res.json({ success: true, sent: notifications.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
