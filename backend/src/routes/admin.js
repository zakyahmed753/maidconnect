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

// Get referral link by maid name — /fix/ref-by-name?secret=servix2026&name=Lawal+fatima
router.get('/fix/ref-by-name', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const Maid = require('../models/Maid');
  const maid = await Maid.findOne({ fullName: new RegExp(req.query.name, 'i') });
  if (!maid) return res.status(404).json({ ok: false, msg: 'Maid not found' });
  res.json({ ok: true, name: maid.fullName, code: maid.referralCode, link: maid.referralCode ? `https://servix.world/register?mref=${maid.referralCode}` : null });
});

// Generate referral codes for all approved maids + create Coupon documents
router.get('/fix/generate-maid-coupons', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const { randomBytes } = require('crypto');
  const Maid = require('../models/Maid');
  const { Coupon } = require('../models/index');
  const maids = await Maid.find({ approvalStatus: 'approved' });
  const results = [];
  for (const maid of maids) {
    // Assign referralCode if missing
    if (!maid.referralCode) {
      let code;
      for (let i = 0; i < 20; i++) {
        const candidate = randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
        const taken = await Maid.findOne({ referralCode: candidate });
        if (!taken) { code = candidate; break; }
      }
      if (!code) continue;
      maid.referralCode = code;
      await maid.save();
    }
    // Upsert Coupon document
    await Coupon.findOneAndUpdate(
      { code: maid.referralCode },
      {
        code:          maid.referralCode,
        type:          'referral',
        discountType:  'percentage',
        discountValue: 15,
        maidRef:       maid._id,
        isActive:      true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    results.push({ name: maid.fullName, code: maid.referralCode });
  }
  res.json({ ok: true, total: results.length, maids: results });
});

// Remove test maids by name — usage: /fix/remove-test-maids?secret=servix2026&names=test,menna
router.get('/fix/remove-test-maids', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const User = require('../models/User');
  const Maid = require('../models/Maid');
  const names = (req.query.names || '').split(',').map(n => n.trim().toLowerCase()).filter(Boolean);
  if (!names.length) return res.status(400).json({ ok: false, msg: 'Provide ?names=name1,name2' });
  const regex = new RegExp(names.map(n => `^${n}$`).join('|'), 'i');
  const maids = await Maid.find({ fullName: regex });
  const userIds = maids.map(m => m.user);
  await Maid.deleteMany({ _id: { $in: maids.map(m => m._id) } });
  await User.deleteMany({ _id: { $in: userIds } });
  res.json({ ok: true, removed: maids.map(m => ({ name: m.fullName, userId: m.user })) });
});

// Backfill missing referralCodes for all maids
router.get('/fix/backfill-ref-codes', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const { randomBytes } = require('crypto');
  const Maid = require('../models/Maid');
  const maids = await Maid.find({ referralCode: { $in: [null, undefined, ''] } });
  const assigned = [];
  for (const maid of maids) {
    let code;
    for (let i = 0; i < 20; i++) {
      const candidate = randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
      const taken = await Maid.findOne({ referralCode: candidate });
      if (!taken) { code = candidate; break; }
    }
    if (!code) continue;
    await Maid.updateOne({ _id: maid._id }, { referralCode: code });
    assigned.push({ name: maid.fullName, code });
  }
  res.json({ ok: true, assigned });
});

// Manually apply a referral (for already-registered maids)
// Usage: /fix/apply-referral?secret=servix2026&maidEmail=meena@x.com&refCode=ABC123
router.get('/fix/apply-referral', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const { maidEmail, refCode } = req.query;
  if (!maidEmail || !refCode) return res.status(400).json({ ok: false, msg: 'maidEmail and refCode required' });
  const User = require('../models/User');
  const Maid = require('../models/Maid');
  const user = await User.findOne({ email: maidEmail.toLowerCase().trim() });
  if (!user) return res.status(404).json({ ok: false, msg: 'User not found' });
  const maid = await Maid.findOne({ user: user._id });
  if (!maid) return res.status(404).json({ ok: false, msg: 'Maid profile not found' });
  if (maid.referredBy) return res.json({ ok: true, msg: 'Already has referredBy: ' + maid.referredBy });
  const referrer = await Maid.findOne({ referralCode: refCode.toUpperCase().trim() });
  if (!referrer) return res.status(404).json({ ok: false, msg: 'Referral code not found: ' + refCode });
  await Maid.updateOne({ _id: maid._id }, { referredBy: refCode.toUpperCase().trim() });
  await Maid.updateOne({ referralCode: refCode.toUpperCase().trim() }, { $inc: { referralCount: 1 } });
  res.json({ ok: true, msg: `Credited ${referrer.fullName} (${refCode}) for referring ${maid.fullName}` });
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

// Update a maid's agentName by name match
// Usage: GET /api/admin/fix/set-agent?secret=servix2026&maidName=asisat&agent=rodiyat
router.get('/fix/set-agent', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const Maid = require('../models/Maid');
  const { maidName, agent } = req.query;
  if (!maidName || !agent) return res.status(400).json({ ok: false, msg: 'Pass ?maidName=&agent=' });
  const maid = await Maid.findOne({ fullName: new RegExp(maidName, 'i') });
  if (!maid) return res.status(404).json({ ok: false, msg: 'Maid not found' });
  const prev = maid.agentName;
  await Maid.updateOne({ _id: maid._id }, { agentName: agent.toLowerCase().trim(), heardAboutUs: 'agent' });
  res.json({ ok: true, name: maid.fullName, prev, now: agent.toLowerCase().trim() });
});

// Count registrations by agent lead source
// Usage: GET /api/admin/fix/agent-count?secret=servix2026&agent=rodiyat
router.get('/fix/agent-count', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const Maid = require('../models/Maid');
  const agent = (req.query.agent || '').toLowerCase().trim();
  if (!agent) return res.status(400).json({ ok: false, msg: 'Pass ?agent=name' });
  const maids = await Maid.find({ agentName: agent }).select('fullName approvalStatus createdAt').sort({ createdAt: -1 });
  res.json({ ok: true, agent, total: maids.length, maids: maids.map(m => ({ name: m.fullName, status: m.approvalStatus, joinedAt: m.createdAt })) });
});

// Send referral campaign email to all approved maids
// Usage: GET /api/admin/fix/send-referral-campaign?secret=servix2026
// Returns: { ok, sent, failed, results: [{ name, email, code, link, sent }] }
router.get('/fix/send-referral-campaign', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const { randomBytes } = require('crypto');
  const User = require('../models/User');
  const Maid = require('../models/Maid');
  const { sendReferralCampaignEmail } = require('../utils/email');

  const maids = await Maid.find({ approvalStatus: 'approved' }).populate('user', 'email');
  const results = [];

  for (const maid of maids) {
    const email = maid.user?.email;
    if (!email) {
      results.push({ name: maid.fullName, email: null, code: null, link: null, sent: false, reason: 'no user email' });
      continue;
    }

    // Backfill referralCode if missing
    let code = maid.referralCode;
    if (!code) {
      for (let i = 0; i < 20; i++) {
        const candidate = randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
        const taken = await Maid.findOne({ referralCode: candidate });
        if (!taken) { code = candidate; break; }
      }
      if (code) await Maid.updateOne({ _id: maid._id }, { referralCode: code });
    }

    const link = code ? `https://servix.world/register?mref=${code}` : null;

    try {
      await sendReferralCampaignEmail(email, maid.fullName, code);
      results.push({ name: maid.fullName, email, code, link, sent: true });
    } catch (err) {
      results.push({ name: maid.fullName, email, code, link, sent: false, reason: err.message });
    }
  }

  const sent = results.filter(r => r.sent).length;
  const failed = results.filter(r => !r.sent).length;
  res.json({ ok: true, sent, failed, results });
});

// Seed existing hardcoded agents into LeadSource collection (one-time)
// DELETE test maids with single-letter names (m, k, etc.)
router.get('/fix/delete-test-maids', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const Maid = require('../models/Maid');
  const User = require('../models/User');
  const testNames = ['m', 'k', 'M', 'K', 'mm', 'kk', 'test', 'Test'];
  const maids = await Maid.find({ fullName: { $in: testNames } }).select('fullName user createdAt');
  const ids = maids.map(m => m._id);
  const userIds = maids.map(m => m.user);
  await Maid.deleteMany({ _id: { $in: ids } });
  await User.deleteMany({ _id: { $in: userIds } });
  res.json({ ok: true, deleted: maids.map(m => ({ id: m._id, name: m.fullName, user: m.user })) });
});

router.get('/fix/seed-lead-sources', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const LeadSource = require('../models/LeadSource');
  const defaults = [
    { name: 'Victoria', slug: 'victoria', color: '#5dd6a8' },
    { name: 'Latifa',   slug: 'latifa',   color: '#5dd6a8' },
    { name: 'Rodiyat',  slug: 'rodiyat',  color: '#b47adb' },
  ];
  const results = [];
  for (const d of defaults) {
    const doc = await LeadSource.findOneAndUpdate(
      { slug: d.slug },
      { $setOnInsert: d },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    results.push({ slug: d.slug, id: doc._id });
  }
  res.json({ ok: true, seeded: results });
});

// Reset all payment records (one-time use — fresh launch)
// Usage: GET /api/admin/fix/reset-payments?secret=servix2026
router.get('/fix/reset-payments', async (req, res) => {
  if (req.query.secret !== 'servix2026') return res.status(403).json({ ok: false });
  const { Payment } = require('../models/index');
  const result = await Payment.deleteMany({});
  res.json({ ok: true, deleted: result.deletedCount });
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
router.get('/lead-sources',             protect, adminOnly, ac.getLeadSources);
router.post('/lead-sources',            protect, adminOnly, ac.createLeadSource);
router.delete('/lead-sources/:id',      protect, adminOnly, ac.deleteLeadSource);
router.post('/payments/:paymentId/confirm-customer', protect, adminOnly, ac.confirmCustomerOfflinePayment);
router.delete('/maids/:id/hard-delete',             protect, adminOnly, ac.hardDeleteMaid);


module.exports = router;
