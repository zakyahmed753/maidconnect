const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['maid', 'housewife', 'admin'],
    required: true
  },

  // ── Basic Info ──
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, trim: true },
  password: { type: String, select: false },
  avatar: { type: String, default: null },

  // ── Social Auth ──
  googleId:   { type: String, default: null },
  appleId:    { type: String, default: null },
  facebookId: { type: String, default: null },
  authProvider: { type: String, enum: ['local','google','apple','facebook'], default: 'local' },

  // ── Account Status ──
  isVerified:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  suspendReason: { type: String, default: null },

  // ── Notifications ──
  fcmToken: { type: String, default: null }, // for push notifications
  pushEnabled: { type: Boolean, default: true },

  // ── Timestamps ──
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
