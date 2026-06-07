const express = require('express');
const router = express.Router();
const { Config } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

const ALL_AREAS = [
  'Maadi', 'Zamalek', 'New Cairo', 'Heliopolis',
  'Nasr City', 'Dokki', 'Mohandessin', 'Sheikh Zayed',
  '6th of October', 'Garden City', 'Rehab City', 'Madinaty',
  'Shorouk', 'Gesr El Suez', 'Other',
];
const DEFAULT_ACTIVE = ['Maadi', 'Zamalek', 'New Cairo', 'Heliopolis', 'Sheikh Zayed', '6th of October'];

// GET /api/config/areas — public
router.get('/areas', async (req, res) => {
  try {
    let cfg = await Config.findOne({ key: 'activeAreas' });
    if (!cfg) cfg = await Config.create({ key: 'activeAreas', value: DEFAULT_ACTIVE });
    res.json({ success: true, allAreas: ALL_AREAS, activeAreas: cfg.value });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/config/areas — admin only
router.put('/areas', protect, adminOnly, async (req, res) => {
  try {
    const { activeAreas } = req.body;
    if (!Array.isArray(activeAreas)) return res.status(400).json({ success: false, message: 'activeAreas must be an array' });
    const cfg = await Config.findOneAndUpdate(
      { key: 'activeAreas' },
      { value: activeAreas, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json({ success: true, activeAreas: cfg.value });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/config/terms — public
router.get('/terms', async (req, res) => {
  try {
    const cfg = await Config.findOne({ key: 'termsUrl' });
    res.json({ success: true, termsUrl: cfg?.value || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/config/terms — admin only
router.put('/terms', protect, adminOnly, async (req, res) => {
  try {
    const { termsUrl } = req.body;
    if (!termsUrl) return res.status(400).json({ success: false, message: 'termsUrl required' });
    const cfg = await Config.findOneAndUpdate(
      { key: 'termsUrl' },
      { value: termsUrl, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json({ success: true, termsUrl: cfg.value });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
