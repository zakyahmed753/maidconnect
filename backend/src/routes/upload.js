const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { protect } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const imgStorage = new CloudinaryStorage({
  cloudinary,
  params: (req) => ({
    folder: `maidconnect/users/${req.user._id}`,
    allowed_formats: ['jpg','jpeg','png','webp'],
    transformation: [{ width: 900, crop: 'limit', quality: 'auto:good' }]
  })
});
const voiceStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'maidconnect/voice', resource_type: 'video', allowed_formats: ['mp3','aac','m4a','wav','ogg'] }
});

const uploadImg   = multer({ storage: imgStorage,   limits: { fileSize: 5 * 1024 * 1024 } });
const uploadVoice = multer({ storage: voiceStorage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/image', protect, uploadImg.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  res.json({ success: true, url: req.file.path, publicId: req.file.filename });
});

router.post('/voice', protect, uploadVoice.single('voice'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  res.json({ success: true, url: req.file.path, publicId: req.file.filename, duration: req.body.duration });
});

module.exports = router;
