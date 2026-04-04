const mongoose = require('mongoose');

// ── HouseWife Profile ──
const houseWifeSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName:{ type: String, required: true },
  country: { type: String, default: 'Egypt' },
  city:    { type: String },
  savedMaids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Maid' }],
  hiredMaids: [{
    maid:      { type: mongoose.Schema.Types.ObjectId, ref: 'Maid' },
    hiredAt:   { type: Date, default: Date.now },
    commissionPaid: { type: Boolean, default: false },
    commissionAmount: { type: Number }
  }],
  createdAt: { type: Date, default: Date.now }
});

// ── Chat ──
const chatSchema = new mongoose.Schema({
  housewife: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  maid:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  maidProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Maid' },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  lastMessageAt: { type: Date, default: Date.now },
  isActive:  { type: Boolean, default: true },
  // Approval tracking
  approvalStatus: {
    type: String,
    enum: ['chatting','interview','approved','rejected','hired'],
    default: 'chatting'
  },
  createdAt: { type: Date, default: Date.now }
});
chatSchema.index({ housewife: 1, maid: 1 }, { unique: true });

// ── Message ──
const messageSchema = new mongoose.Schema({
  chat:   { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:   { type: String, enum: ['text','voice','image','system'], default: 'text' },
  content: { type: String },          // text content
  voiceUrl: { type: String },         // cloudinary url for voice
  voiceDuration: { type: Number },    // seconds
  imageUrl: { type: String },
  isRead:  { type: Boolean, default: false },
  readAt:  { type: Date },
  createdAt: { type: Date, default: Date.now }
});
messageSchema.index({ chat: 1, createdAt: -1 });

// ── Payment ──
const paymentSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:        { type: String, enum: ['subscription','commission'], required: true },
  method:      { type: String, enum: ['fawry','vodafone_cash','instapay','amazon_pay'], required: true },
  amount:      { type: Number, required: true }, // EGP
  amountUSD:   { type: Number },
  currency:    { type: String, default: 'EGP' },
  status:      { type: String, enum: ['pending','completed','failed','refunded'], default: 'pending' },

  // Reference IDs
  maidProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Maid' },
  hireRef:     { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },

  // Payment gateway data
  gatewayRef:      { type: String },
  gatewayResponse: { type: mongoose.Schema.Types.Mixed },
  fawryRefNum:     { type: String },    // Fawry reference number
  merchantRefNum:  { type: String, default: () => require('uuid').v4() },

  // Subscription details
  subscriptionPlan: { type: String, enum: ['monthly','annual'] },

  // Commission details
  commissionRate: { type: Number },  // percentage
  maidSalary:     { type: Number },

  paidAt:    { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// ── Notification ──
const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    {
    type: String,
    enum: ['like','chat','approval','payment','new_maid','hire_confirmed','subscription','system'],
    required: true
  },
  title:   { type: String, required: true },
  body:    { type: String, required: true },
  data:    { type: mongoose.Schema.Types.Mixed },
  isRead:  { type: Boolean, default: false },
  readAt:  { type: Date },
  createdAt: { type: Date, default: Date.now }
});
notificationSchema.index({ user: 1, isRead: 1 });

// ── Review ──
const reviewSchema = new mongoose.Schema({
  maid:       { type: mongoose.Schema.Types.ObjectId, ref: 'Maid', required: true },
  housewife:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, maxlength: 500 },
  createdAt:  { type: Date, default: Date.now }
});
reviewSchema.index({ maid: 1, housewife: 1 }, { unique: true });

module.exports = {
  HouseWife:    mongoose.model('HouseWife', houseWifeSchema),
  Chat:         mongoose.model('Chat', chatSchema),
  Message:      mongoose.model('Message', messageSchema),
  Payment:      mongoose.model('Payment', paymentSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  Review:       mongoose.model('Review', reviewSchema)
};
