const mongoose = require('mongoose');

const maidSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // ── Personal Info ──
  fullName:    { type: String, required: true },
  age:         { type: Number, required: true, min: 18, max: 60 },
  nationality: { type: String, required: true },
  origin:      { type: String, enum: ['african', 'asian'], required: true },
  languages:   [{ type: String }],
  bio:         { type: String, maxlength: 500 },

  // ── Professional Info ──
  experienceYears: { type: Number, required: true, min: 0 },
  expectedSalary:  { type: Number, required: true }, // USD per month
  skills: [{
    type: String,
    enum: ['Cooking','Childcare','Eldercare','Cleaning','Laundry','Ironing','Driving','Tutoring','Nursing','Pet Care']
  }],
  previousCountries: [{ type: String }],

  // ── Photos (min 3 required) ──
  photos: [{
    url:       { type: String, required: true },
    publicId:  { type: String },
    isPrimary: { type: Boolean, default: false },
    uploadedAt:{ type: Date, default: Date.now }
  }],

  // ── Availability ──
  isAvailable:    { type: Boolean, default: true },
  availableFrom:  { type: Date, default: Date.now },

  // ── Subscription ──
  subscription: {
    plan:      { type: String, enum: ['monthly', 'annual', 'none'], default: 'none' },
    status:    { type: String, enum: ['active', 'expired', 'cancelled', 'pending'], default: 'pending' },
    startDate: { type: Date },
    endDate:   { type: Date },
    paymentId: { type: String }
  },

  // ── Admin Approval ──
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  approvalNote:    { type: String },
  approvedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt:      { type: Date },

  // ── Stats ──
  stats: {
    views:     { type: Number, default: 0 },
    likes:     { type: Number, default: 0 },
    chats:     { type: Number, default: 0 },
    hireCount: { type: Number, default: 0 }
  },

  // ── Reviews ──
  rating:      { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

maidSchema.index({ approvalStatus: 1, isAvailable: 1 });
maidSchema.index({ nationality: 1, origin: 1 });
maidSchema.index({ expectedSalary: 1 });
maidSchema.index({ 'subscription.status': 1 });

module.exports = mongoose.model('Maid', maidSchema);
