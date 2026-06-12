const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  email:     { type: String, required: true, lowercase: true },
  otp:       { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // auto-delete after 10 min
});
schema.index({ email: 1 }, { unique: true });
module.exports = mongoose.model('PreRegOTP', schema);
