// ── auth.js ──
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',          ctrl.register);
router.post('/login',             ctrl.login);
router.post('/social',            ctrl.socialAuth);
router.get('/me',                 protect, ctrl.getMe);
router.put('/fcm-token',          protect, ctrl.updateFCMToken);
router.put('/change-password',    protect, ctrl.changePassword);

module.exports = router;
