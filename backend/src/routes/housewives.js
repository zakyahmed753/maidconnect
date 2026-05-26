const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { HouseWife, Notification, Chat, HireRequest } = require('../models/index');
const Maid = require('../models/Maid');
const User = require('../models/User');
const { sendEmail, hireRequestEmail } = require('../utils/email');
const { sendPush } = require('../utils/push');

// GET /housewives/me
router.get('/me', protect, async (req, res) => {
  try {
    const hw = await HouseWife.findOne({ user: req.user._id })
      .populate({ path: 'savedMaids', populate: { path: 'user', select: 'name' } })
      .populate({ path: 'hiredMaids.maid', populate: { path: 'user', select: 'name' } });

    // Attach pending hire request maid IDs so the app can show "Request Sent" state
    const pending = await HireRequest.find({ housewife: req.user._id, status: 'pending' }).select('maid');
    const pendingMaidIds = pending.map(r => String(r.maid));

    res.json({ success: true, profile: hw, pendingHireRequests: pendingMaidIds });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /housewives/me
router.put('/me', protect, async (req, res) => {
  try {
    const hw = await HouseWife.findOneAndUpdate(
      { user: req.user._id }, req.body, { new: true }
    );
    res.json({ success: true, profile: hw });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /housewives/hire — send hire request to maid (push + email)
router.post('/hire', protect, async (req, res) => {
  try {
    const { maidProfileId, chatId } = req.body;
    if (!maidProfileId) return res.status(400).json({ success: false, message: 'maidProfileId required' });

    const maid = await Maid.findById(maidProfileId).populate('user', 'name email fcmToken');
    if (!maid) return res.status(404).json({ success: false, message: 'Maid not found' });

    // Check for existing request
    const existing = await HireRequest.findOne({ housewife: req.user._id, maid: maidProfileId, status: 'pending' });
    if (existing) return res.json({ success: true, requestId: existing._id, alreadyPending: true });

    const hwProfile = await HouseWife.findOne({ user: req.user._id });
    const request = await HireRequest.create({
      housewife: req.user._id,
      hwProfile: hwProfile?._id,
      maid: maidProfileId,
      chatId: chatId || null,
    });

    // In-app notification for maid
    const hwUser = req.user;
    await Notification.create({
      user: maid.user._id,
      type: 'hire_request',
      title: '👑 New Hire Request!',
      body: `${hwUser.name} wants to hire you. Open the app to approve or reject.`,
      data: { requestId: String(request._id), screen: 'HireRequest' },
    });

    // Push notification
    await sendPush({
      token: maid.user.fcmToken,
      title: '👑 New Hire Request!',
      body: `${hwUser.name} wants to hire you.`,
      data: { requestId: String(request._id), screen: 'HireRequest' },
    });

    // Email to maid
    await sendEmail({
      to: maid.user.email,
      subject: `Hire Request from ${hwUser.name} — Servix`,
      html: hireRequestEmail(maid.fullName, hwUser.name),
    });

    res.json({ success: true, requestId: request._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
