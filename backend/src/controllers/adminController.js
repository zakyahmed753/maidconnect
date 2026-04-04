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

    res.json({
      success: true,
      stats: {
        totalMaids, activeMaids, pendingMaids, totalHW,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRev[0]?.total || 0,
        totalHires, pendingPayments,
        monthlyBreakdown, revenueByType
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

// ── Approve / Reject Maid ──
exports.updateMaidStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const maid = await Maid.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: status, approvalNote: note, approvedBy: req.user._id, approvedAt: Date.now() },
      { new: true }
    ).populate('user');

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
      .populate('maidProfile', 'fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, payments, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
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
