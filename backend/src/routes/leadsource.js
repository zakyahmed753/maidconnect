const express = require('express');
const router  = express.Router();
const { protect, leadsourceOnly } = require('../middleware/auth');
const Maid    = require('../models/Maid');
const { HouseWife } = require('../models/index');

// GET /api/leadsource/dashboard
// Returns maids referred by this lead source with status, last seen, hired count
router.get('/dashboard', protect, leadsourceOnly, async (req, res) => {
  try {
    const slug = req.user.leadSourceSlug;
    if (!slug) return res.status(400).json({ success: false, message: 'No lead source assigned' });

    const maids = await Maid.find({ heardAboutUs: 'agent', agentName: slug })
      .populate('user', 'name email lastSeen createdAt')
      .lean();

    // Build hired-count map from HouseWife collection
    const maidIds = maids.map(m => m._id);
    const hiredAgg = await HouseWife.aggregate([
      { $project: { allHired: { $concatArrays: [
        { $ifNull: ['$hiredMaids', []] },
        { $ifNull: ['$pastHiredMaids', []] },
      ]}}},
      { $unwind: '$allHired' },
      { $match: { 'allHired.maid': { $in: maidIds } } },
      { $group: { _id: '$allHired.maid', count: { $sum: 1 } } },
    ]);
    const hiredMap = Object.fromEntries(hiredAgg.map(h => [String(h._id), h.count]));

    const result = maids.map(m => ({
      _id:           m._id,
      fullName:      m.fullName,
      nationality:   m.nationality,
      approvalStatus:m.approvalStatus,
      isHired:       m.isHired,
      isAvailable:   m.isAvailable,
      photo:         m.photos?.find(p => p.isPrimary)?.url || m.photos?.[0]?.url || null,
      lastSeen:      m.user?.lastSeen || null,
      joinedAt:      m.user?.createdAt || null,
      hiredCount:    hiredMap[String(m._id)] || 0,
    }));

    res.json({ success: true, slug, total: result.length, maids: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
