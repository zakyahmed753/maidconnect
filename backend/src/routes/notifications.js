const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Notification } = require('../models/index');

router.get('/', protect, async (req, res) => {
  const notifs = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, notifications: notifs });
});
router.put('/:id/read', protect, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: Date.now() });
  res.json({ success: true });
});
router.put('/read-all', protect, async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
});

module.exports = router;
