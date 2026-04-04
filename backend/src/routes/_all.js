// ─── maids.js ───
const express = require('express');
const r1 = express.Router();
const mc = require('../controllers/maidController');
const { protect, maidOnly } = require('../middleware/auth');

r1.get('/',                protect, mc.getAllMaids);
r1.get('/me',              protect, maidOnly, mc.getMyProfile);
r1.get('/:id',             protect, mc.getMaid);
r1.post('/',               protect, maidOnly, mc.createProfile);
r1.put('/me',              protect, maidOnly, mc.updateProfile);
r1.post('/me/photos',      protect, maidOnly, mc.addPhoto);
r1.delete('/me/photos/:photoId', protect, maidOnly, mc.deletePhoto);
r1.post('/:id/like',       protect, mc.toggleLike);
r1.get('/saved/list',      protect, mc.getSavedMaids);

module.exports = { maids: r1 };

// ─── chats.js ───
const r2 = express.Router();
const cc = require('../controllers/chatController');

r2.post('/start',             protect, cc.getOrCreateChat);
r2.get('/',                   protect, cc.getMyChats);
r2.get('/:chatId/messages',   protect, cc.getMessages);
r2.post('/message',           protect, cc.sendMessage);
r2.put('/:chatId/approval',   protect, cc.updateApprovalStatus);

module.exports = { chats: r2 };

// ─── payments.js ───
const r3 = express.Router();
const pc = require('../controllers/paymentController');

r3.post('/fawry',         protect, pc.initFawry);
r3.post('/vodafone-cash', protect, pc.initVodafoneCash);
r3.post('/instapay',      protect, pc.initInstaPay);
r3.post('/amazon-pay',    protect, pc.initAmazonPay);
r3.post('/callback',      pc.paymentCallback);  // webhook - no auth
r3.get('/history',        protect, pc.getHistory);
r3.get('/:id/status',     protect, pc.checkStatus);

module.exports = { payments: r3 };

// ─── admin.js ───
const r4 = express.Router();
const ac = require('../controllers/adminController');
const { adminOnly } = require('../middleware/auth');

r4.get('/dashboard',              protect, adminOnly, ac.getDashboard);
r4.get('/maids',                  protect, adminOnly, ac.getAllMaids);
r4.put('/maids/:id/status',       protect, adminOnly, ac.updateMaidStatus);
r4.get('/housewives',             protect, adminOnly, ac.getAllHouseWives);
r4.put('/users/:userId/suspend',  protect, adminOnly, ac.toggleSuspend);
r4.get('/payments',               protect, adminOnly, ac.getPayments);
r4.post('/broadcast',             protect, adminOnly, ac.broadcastNotification);

module.exports = { admin: r4 };

// ─── notifications.js ───
const r5 = express.Router();
const { Notification } = require('../models/index');

r5.get('/', protect, async (req, res) => {
  const notifs = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, notifications: notifs });
});
r5.put('/:id/read', protect, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: Date.now() });
  res.json({ success: true });
});
r5.put('/read-all', protect, async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: Date.now() });
  res.json({ success: true });
});

module.exports = { notifications: r5 };

// ─── upload.js ───
const r6 = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: `maidconnect/${req.user._id}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, crop: 'limit', quality: 'auto' }]
  })
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Voice note upload
const voiceStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'maidconnect/voice', resource_type: 'video', allowed_formats: ['mp3', 'aac', 'm4a', 'wav', 'ogg'] }
});
const uploadVoice = multer({ storage: voiceStorage, limits: { fileSize: 10 * 1024 * 1024 } });

r6.post('/image',  protect, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: req.file.path, publicId: req.file.filename });
});

r6.post('/voice',  protect, uploadVoice.single('voice'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: req.file.path, publicId: req.file.filename });
});

module.exports = { upload: r6 };
