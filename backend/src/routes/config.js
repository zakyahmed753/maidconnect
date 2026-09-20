const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const gplay   = require('google-play-scraper').default;
const { Config } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

const IOS_APP_ID    = '6782191284';
const ANDROID_APP_ID = 'app.servix.world';

// In-memory cache — avoids hitting the stores on every app open
let _iosCache     = { version: null, fetchedAt: 0 };
let _androidCache = { version: null, fetchedAt: 0 };
const CACHE_MS = 30 * 60 * 1000; // 30 minutes
let _iosLastError = null, _androidLastError = null; // TEMP: debugging stale-version issue

async function fetchIosStoreVersion() {
  if (Date.now() - _iosCache.fetchedAt < CACHE_MS && _iosCache.version) return _iosCache.version;
  try {
    const r = await axios.get(
      `https://itunes.apple.com/lookup?id=${IOS_APP_ID}&country=eg`,
      { timeout: 6000 }
    );
    const v = r.data?.results?.[0]?.version || null;
    if (v) _iosCache = { version: v, fetchedAt: Date.now() };
    return v;
  } catch (err) {
    console.error('fetchIosStoreVersion failed:', err.message);
    _iosLastError = err.message;
    return null;
  }
}

// Uses the google-play-scraper library instead of hand-parsing the Play Store
// HTML — Google changes that page's internal data format without notice,
// which previously broke the app's own on-device regex check silently.
async function fetchAndroidStoreVersion() {
  if (Date.now() - _androidCache.fetchedAt < CACHE_MS && _androidCache.version) return _androidCache.version;
  try {
    const r = await gplay.app({ appId: ANDROID_APP_ID });
    const v = r?.version || null;
    if (v) _androidCache = { version: v, fetchedAt: Date.now() };
    return v;
  } catch (err) {
    console.error('fetchAndroidStoreVersion failed:', err.message);
    _androidLastError = err.message;
    return null;
  }
}

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

// GET /api/config/version — public
// Both platforms: auto-fetched live from their store (iTunes API / Play Store
// listing). DB config is only a manual fallback if a live lookup ever fails.
router.get('/version', async (req, res) => {
  try {
    const [iosLive, androidLive, cfg] = await Promise.all([
      fetchIosStoreVersion(),
      fetchAndroidStoreVersion(),
      Config.findOne({ key: 'appVersion' }),
    ]);
    const db = cfg?.value || { ios: '1.3.7', android: '1.3.7' };
    const out = {
      success: true,
      ios:     iosLive || db.ios,
      android: androidLive || db.android,
    };
    if (req.query.debug === '1') { // TEMP: debugging stale-version issue
      out.iosError = _iosLastError;
      out.androidError = _androidLastError;
    }
    res.json(out);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// PUT /api/config/version — admin only; call this when releasing a new build
router.put('/version', protect, adminOnly, async (req, res) => {
  try {
    const { ios, android } = req.body;
    if (!ios && !android) return res.status(400).json({ success: false, message: 'ios or android version required' });
    const existing = await Config.findOne({ key: 'appVersion' });
    const current = existing?.value || { ios: '1.3.7', android: '1.3.7' };
    const value = { ios: ios || current.ios, android: android || current.android };
    const cfg = await Config.findOneAndUpdate(
      { key: 'appVersion' },
      { value, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json({ success: true, ios: cfg.value.ios, android: cfg.value.android });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/config/lead-sources — public (for register form dropdown)
router.get('/lead-sources', async (req, res) => {
  try {
    const LeadSource = require('../models/LeadSource');
    const sources = await LeadSource.find({ isActive: true }).select('name slug color').sort({ createdAt: 1 });
    res.json({ success: true, sources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
