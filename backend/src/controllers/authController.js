const User = require('../models/User');
const Maid = require('../models/Maid');
const { HouseWife, Notification } = require('../models/index');
const { generateToken } = require('../middleware/auth');

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

    const user = await User.create({ name, email, password, phone, role });

    // Create role-specific profile
    if (role === 'housewife') {
      await HouseWife.create({ user: user._id, fullName: name });
    }

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: user.toSafeObject() });
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

// ── Update Profile (name, phone) ──
exports.updateMe = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, updatedAt: Date.now() },
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
