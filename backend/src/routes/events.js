const express = require('express');
const router  = express.Router();
const { AppEvent } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/events — mobile app sends events; auth optional (guests included)
router.post('/', async (req, res) => {
  try {
    const { name, meta, platform, appVersion } = req.body;
    if (!name) return res.status(400).json({ success: false });

    // Optionally attach user from token if present
    let userId = null;
    let role   = 'guest';
    try {
      const jwt = require('jsonwebtoken');
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        const User = require('../models/User');
        const u = await User.findById(userId).select('role').lean();
        if (u) role = u.role === 'maid' ? 'maid' : 'housewife';
      }
    } catch {}

    await AppEvent.create({ userId, role, name, meta, platform, appVersion });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// GET /api/events — admin only: fetch events with stats
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { days = 7, name: filterName, limit = 200 } = req.query;
    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

    const [events, stats] = await Promise.all([
      AppEvent.find({ createdAt: { $gte: since }, ...(filterName ? { name: filterName } : {}) })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .populate('userId', 'name email role')
        .lean(),
      AppEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // DAU: distinct users per day (last N days)
    const dauData = await AppEvent.aggregate([
      { $match: { createdAt: { $gte: since }, userId: { $ne: null } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            user: '$userId',
          },
        },
      },
      { $group: { _id: '$_id.day', users: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, events, stats, dauData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
