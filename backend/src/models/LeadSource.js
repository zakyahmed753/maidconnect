const mongoose = require('mongoose');
const leadSourceSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  slug:     { type: String, required: true, unique: true },
  color:    { type: String, default: '#5dd6a8' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('LeadSource', leadSourceSchema);
