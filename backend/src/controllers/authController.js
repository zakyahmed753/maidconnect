const User = require('../models/User');
const Maid = require('../models/Maid');
const { HouseWife, Notification } = require('../models/index');
const { generateToken } = require('../middleware/auth');
const { sendOTPEmail, sendResetEmail } = require('../utils/email');
const bcrypt = require('bcryptjs');

const genCode = () => String(Math.floor(100000 + Math.random() * 900000));

// ── Register ──
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!['maid','housewife'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      const conflictMsg = exists.role !== role
        ? `This email is already registered as a ${exists.role}. Each account must use a unique email.`
        : 'Email already in use';
      return res.status(400).json({ success: false, message: conflictMsg });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    const EGYPTIAN_PHONE = /^01[0125][0-9]{8}$/;
    const normalizedPhone = phone.trim().replace(/\s|-/g, '');
    if (!EGYPTIAN_PHONE.test(normalizedPhone)) {
      return res.status(400).json({ success: false, message: 'Phone must be a valid Egyptian mobile number (e.g. 01012345678)' });
    }
    const phoneExists = await User.findOne({ phone: normalizedPhone });
    if (phoneExists) {
      return res.status(400).json({ success: false, message: 'This phone number is already registered' });
    }

    const otp = genCode();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
      name, email, password, phone: normalizedPhone, role,
      emailVerified: false, otpCode: otp, otpExpiry,
    });

    // Create role-specific profile
    if (role === 'housewife') {
      await HouseWife.create({ user: user._id, fullName: name });
    }

    // Send OTP email (non-blocking — don't fail registration if email fails)
    sendOTPEmail(email, otp).catch(e => console.error('[OTP email]', e.message));

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: user.toSafeObject(), requiresOTP: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Login ──
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    // Enforce role: maid can't login as customer and vice versa
    if (role && user.role !== 'admin' && user.role !== role) {
      return res.status(403).json({ success: false, message: `This account is registered as a ${user.role}. Please sign in from the correct tab.` });
    }
    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: `Account suspended: ${user.suspendReason}` });
    }
    user.lastSeen = Date.now();
    await user.save({ validateBeforeSave: false });
    const token = generateToken(user._id);
    res.json({ success: true, token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Social Auth (Google / Apple / Facebook) ──
exports.socialAuth = async (req, res) => {
  try {
    const { provider, providerId, email, name, avatar, role } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name, email, role: role || 'housewife',
        [`${provider}Id`]: providerId,
        authProvider: provider,
        avatar,
        isVerified: true
      });
      if (user.role === 'housewife') {
        await HouseWife.create({ user: user._id, fullName: name });
      }
    } else {
      user[`${provider}Id`] = providerId;
      user.authProvider = provider;
      user.lastSeen = Date.now();
      await user.save({ validateBeforeSave: false });
    }
    const token = generateToken(user._id);
    res.json({ success: true, token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Current User ──
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === 'maid') {
      profile = await Maid.findOne({ user: user._id });
    } else if (user.role === 'housewife') {
      profile = await HouseWife.findOne({ user: user._id });
    }

    // Auto-expire maid subscription if past end date
    if (profile && user.role === 'maid' && profile.subscription?.status === 'active' && profile.subscription?.endDate) {
      if (new Date(profile.subscription.endDate) < new Date()) {
        await Maid.findByIdAndUpdate(profile._id, { 'subscription.status': 'expired' });
        profile.subscription.status = 'expired';
      }
    }

    res.json({ success: true, user: user.toSafeObject(), profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update FCM Token (push notifications) ──
exports.updateFCMToken = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { fcmToken: req.body.token });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update Profile (name, phone, fcmToken) ──
exports.updateMe = async (req, res) => {
  try {
    const { name, phone, fcmToken } = req.body;
    const update = { updatedAt: Date.now() };
    if (name !== undefined) update.name = name;
    if (phone !== undefined) update.phone = phone;
    if (fcmToken !== undefined) update.fcmToken = fcmToken;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      update,
      { new: true, runValidators: true }
    );
    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Change Password ──
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete Own Account (soft delete) ──
exports.deleteAccount = async (req, res) => {
  try {
    const { reason } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      deletedAt: new Date(),
      deletionReason: reason || 'User requested account removal',
    });
    res.json({ success: true, message: 'Account deactivated. Contact admin to restore.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Verify Email OTP ──
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.emailVerified) return res.json({ success: true, message: 'Already verified' });
    if (!user.otpCode || user.otpCode !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid code' });
    }
    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ success: false, message: 'Code expired — request a new one' });
    }
    await User.findByIdAndUpdate(user._id, {
      emailVerified: true, otpCode: null, otpExpiry: null,
    });
    res.json({ success: true, message: 'Email verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Resend OTP ──
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.emailVerified) return res.json({ success: true, message: 'Already verified' });
    const otp = genCode();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await User.findByIdAndUpdate(user._id, { otpCode: otp, otpExpiry });
    await sendOTPEmail(email, otp);
    res.json({ success: true, message: 'New code sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Forgot Password — send reset code ──
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always respond OK to prevent email enumeration
    if (!user) return res.json({ success: true, message: 'If that email exists, a code was sent' });
    const code = genCode();
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await User.findByIdAndUpdate(user._id, { resetCode: code, resetExpiry });
    await sendResetEmail(email, code);
    res.json({ success: true, message: 'Reset code sent to your email' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Reset Password ──
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.resetCode || user.resetCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid reset code' });
    }
    if (new Date() > new Date(user.resetExpiry)) {
      return res.status(400).json({ success: false, message: 'Code expired — request a new one' });
    }
    user.password = newPassword;
    user.resetCode = null;
    user.resetExpiry = null;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
