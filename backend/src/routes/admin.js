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

// Admin-only routes
router.get('/dashboard',                protect, adminOnly, ac.getDashboard);
router.put('/maids/:id/subscription',   protect, adminOnly, ac.activateSubscription);
router.post('/maids/:id/offline-payment', protect, adminOnly, ac.offlinePayment);
router.put('/maids/:id/hired',          protect, adminOnly, ac.toggleHired);
router.get('/housewives',               protect, adminOnly, ac.getAllHouseWives);
router.put('/users/:userId/suspend',    protect, adminOnly, ac.toggleSuspend);
router.put('/users/:userId/delete',     protect, adminOnly, ac.softDeleteUser);
router.put('/users/:userId/restore',    protect, adminOnly, ac.restoreUser);
router.get('/payments',                 protect, adminOnly, ac.getPayments);
router.post('/payments/reject-offline', protect, adminOnly, ac.rejectOfflinePayment);
router.post('/broadcast',               protect, adminOnly, ac.broadcastNotification);
router.post('/agents',                  protect, adminOnly, ac.createAgent);
router.get('/agents',                   protect, adminOnly, ac.listAgents);

module.exports = router;
