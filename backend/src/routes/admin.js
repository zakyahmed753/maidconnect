const express = require('express');
const router = express.Router();
const ac = require('../controllers/adminController');
const { protect, adminOnly, adminOrAgent } = require('../middleware/auth');

// Agent-accessible routes
router.get('/maids',                    protect, adminOrAgent, ac.getAllMaids);
router.get('/maids/:id',                protect, adminOrAgent, ac.getMaid);
router.put('/maids/:id/status',         protect, adminOrAgent, ac.updateMaidStatus);
router.put('/maids/:id/verify',         protect, adminOrAgent, ac.verifyIdentity);

// Test helper: re-activate chats between a customer and maid (testing only)
router.get('/fix/reactivate-chats', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const User = require('../models/User');
  const { Chat } = require('../models/index');
  const cu = await User.findOne({ email: req.query.customerEmail });
  const mu = await User.findOne({ email: req.query.maidEmail });
  if (!cu || !mu) return res.status(404).json({ ok: false, cu: !!cu, mu: !!mu });
  const result = await Chat.updateMany({ housewife: cu._id, maid: mu._id }, { isActive: true });
  res.json({ ok: true, reactivated: result.modifiedCount });
});

// Temp one-shot unblock fix
router.get('/fix/unblock', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const User = require('../models/User');
  const Maid = require('../models/Maid');
  const { HouseWife } = require('../models/index');
  const cu = await User.findOne({ email: req.query.customerEmail });
  const mu = await User.findOne({ email: req.query.maidEmail });
  const maid = mu ? await Maid.findOne({ user: mu._id }) : null;
  if (!cu || !maid) return res.status(404).json({ ok: false, cu: !!cu, maid: !!maid });
  await HouseWife.findOneAndUpdate({ user: cu._id }, { $pull: { blockedMaids: maid._id } });
  res.json({ ok: true, msg: `Unblocked ${maid.fullName} from ${cu.email}` });
});

// Test push notification — returns token state + Expo delivery receipt
router.get('/fix/test-push', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const User = require('../models/User');
  const axios = require('axios');
  const user = await User.findOne({ email: req.query.email }).select('fcmToken name');
  if (!user) return res.status(404).json({ ok: false, msg: 'user not found' });
  if (!user.fcmToken) return res.json({ ok: false, msg: 'no push token saved for this user', token: null });

  try {
    const r = await axios.post('https://exp.host/--/api/v2/push/send', {
      to: user.fcmToken,
      title: 'Servix Test 🔔',
      body: 'Push notification is working!',
      sound: 'default',
      priority: 'high',
      channelId: 'default',
    }, { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } });
    res.json({ ok: true, token: user.fcmToken, expoResponse: r.data });
  } catch (err) {
    res.json({ ok: false, token: user.fcmToken, error: err.message });
  }
});

// Test email delivery — returns Resend response or error
router.get('/fix/test-email', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const { sendOTPEmail } = require('../utils/email');
  const to = req.query.email;
  if (!to) return res.status(400).json({ ok: false, msg: 'Pass ?email=you@example.com' });
  if (!process.env.RESEND_API_KEY) return res.json({ ok: false, msg: 'RESEND_API_KEY not set on server' });
  try {
    await sendOTPEmail(to, '123456');
    res.json({ ok: true, msg: `Test OTP email sent to ${to}`, from: process.env.EMAIL_FROM || 'noreply@servix.world' });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// Admin-only routes
router.get('/dashboard',                protect, adminOnly, ac.getDashboard);
router.put('/maids/:id/subscription',   protect, adminOnly, ac.activateSubscription);
router.post('/maids/:id/offline-payment', protect, adminOnly, ac.offlinePayment);
router.put('/maids/:id/hired',          protect, adminOnly, ac.toggleHired);
router.post('/maids/:id/release',       protect, adminOnly, ac.releaseMaid);
router.post('/maids/:id/send-email',    protect, adminOnly, ac.sendEmailToMaid);
router.post('/housewives/:hwId/offline-subscription', protect, adminOnly, ac.offlineCustomerSubscription);
router.get('/housewives',               protect, adminOnly, ac.getAllHouseWives);
router.put('/users/:userId/suspend',    protect, adminOnly, ac.toggleSuspend);
router.put('/users/:userId/delete',     protect, adminOnly, ac.softDeleteUser);
router.put('/users/:userId/restore',    protect, adminOnly, ac.restoreUser);
router.get('/payments',                 protect, adminOnly, ac.getPayments);
router.post('/payments/reject-offline', protect, adminOnly, ac.rejectOfflinePayment);
router.post('/broadcast',               protect, adminOnly, ac.broadcastNotification);
router.post('/agents',                  protect, adminOnly, ac.createAgent);
router.get('/agents',                   protect, adminOnly, ac.listAgents);

// One-shot: set Rodiyat as source for approved maids + Suliman Ashabi
router.get('/fix/set-rodiyat', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const Maid = require('../models/Maid');
  const approved = await Maid.find({ approvalStatus: 'approved' }).populate('user', 'email name');
  const suliman  = await Maid.findOne({ fullName: /suliman/i }).populate('user', 'email name');
  const ids = new Set(approved.map(m => m._id.toString()));
  if (suliman) ids.add(suliman._id.toString());
  const result = await Maid.updateMany(
    { _id: { $in: [...ids] } },
    { $set: { heardAboutUs: 'agent', agentName: 'rodiyat' }, $unset: { agentNameOther: '' } }
  );
  const names = [...approved.map(m => m.fullName), ...(suliman ? [suliman.fullName] : [])];
  res.json({ ok: true, updated: result.modifiedCount, maids: [...new Set(names)] });
});

module.exports = router;
