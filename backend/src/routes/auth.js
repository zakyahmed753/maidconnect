// ── auth.js ──
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',               ctrl.register);
router.post('/send-register-otp',      ctrl.sendRegisterOTP);
router.post('/verify-register-otp',    ctrl.verifyRegisterOTP);
router.post('/login',             ctrl.login);
router.post('/social',            ctrl.socialAuth);
router.post('/verify-otp',        ctrl.verifyOTP);
router.post('/resend-otp',        ctrl.resendOTP);
router.post('/forgot-password',   ctrl.forgotPassword);
router.post('/reset-password',    ctrl.resetPassword);
router.get('/me',                 protect, ctrl.getMe);
router.put('/me',                 protect, ctrl.updateMe);
router.put('/fcm-token',          protect, ctrl.updateFCMToken);
router.put('/change-password',    protect, ctrl.changePassword);
router.delete('/me',              protect, ctrl.deleteAccount);

module.exports = router;
