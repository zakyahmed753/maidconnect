const Maid = require('../models/Maid');
const User = require('../models/User');
const { HouseWife, Notification, HireRequest, Payment } = require('../models/index');
const { sendEmail, hireApprovedEmailToCustomer, hireRejectedEmailToCustomer } = require('../utils/email');
const { sendPush } = require('../utils/push');

function getMaidPriceEGP(nationality = '') {
  const n = nationality.toLowerCase();
  if (n.includes('philip') || n.includes('filip')) return 1000;
  if (n.includes('indonesia') || n.includes('ethiopia')) return 800;
  return 500;
}

// ── Create / Update Maid Profile ──
exports.createProfile = async (req, res) => {
  try {
    const exists = await Maid.findOne({ user: req.user._id });
    if (exists) return res.status(400).json({ success: false, message: 'Profile already exists. Use update.' });

    const data = { ...req.body, user: req.user._id };
    // photos come from upload route, stored in req.body.photos
    const maid = await Maid.create(data);
    res.status(201).json({ success: true, maid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const maid = await Maid.findOneAndUpdate(
      { user: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!maid) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, maid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get All Maids (browse - housewife) ──
exports.getAllMaids = async (req, res) => {
  try {
    const {
      origin, nationality, skills, minSalary, maxSalary,
      minAge, maxAge, minExp, isAvailable, name,
      page = 1, limit = 20, sort = 'createdAt'
    } = req.query;

    const filter = {
      approvalStatus: 'approved',
      isHired: false,
      'subscription.status': 'active',
      'subscription.endDate': { $gt: new Date() },
    };

    // Exclude maids blocked/hired; also filter by customer's residential area
    if (req.user?.role === 'housewife') {
      const hw = await HouseWife.findOne({ user: req.user._id }).select('blockedMaids hiredMaids residentialArea');
      const excluded = [];
      if (hw?.blockedMaids?.length) excluded.push(...hw.blockedMaids.map(id => String(id)));
      if (hw?.hiredMaids?.length)   excluded.push(...hw.hiredMaids.map(h => String(h.maid)));
      if (excluded.length) filter._id = { $nin: excluded };
      // Only show maids who serve the customer's area (if area is set and maid has areas set)
      if (hw?.residentialArea) {
        filter.$or = [
          { areasServed: hw.residentialArea },
          { areasServed: { $size: 0 } },  // maids with no area set are shown to all
          { areasServed: { $exists: false } },
        ];
      }
    }

    if (origin)      filter.origin = origin;
    if (nationality) filter.nationality = new RegExp(nationality, 'i');
    if (skills)      filter.skills = { $in: skills.split(',') };
    if (isAvailable) filter.isAvailable = isAvailable === 'true';
    if (minSalary || maxSalary) {
      filter.expectedSalary = {};
      if (minSalary) filter.expectedSalary.$gte = Number(minSalary);
      if (maxSalary) filter.expectedSalary.$lte = Number(maxSalary);
    }
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = Number(minAge);
      if (maxAge) filter.age.$lte = Number(maxAge);
    }
    if (minExp) filter.experienceYears = { $gte: Number(minExp) };
    if (name) filter.fullName = new RegExp(name.trim(), 'i');

    const NEARBY_MAP = {
      'Maadi':          ['New Cairo','Heliopolis','Garden City'],
      'Zamalek':        ['Garden City','Dokki','Mohandessin','Heliopolis'],
      'New Cairo':      ['Maadi','Heliopolis','Rehab City','Madinaty'],
      'Heliopolis':     ['New Cairo','Nasr City','Zamalek'],
      'Sheikh Zayed':   ['6th of October','Mohandessin','Dokki'],
      '6th of October': ['Sheikh Zayed','Mohandessin'],
      'Nasr City':      ['Heliopolis','New Cairo'],
      'Dokki':          ['Mohandessin','Zamalek','Sheikh Zayed'],
      'Mohandessin':    ['Dokki','Zamalek','Sheikh Zayed'],
      'Garden City':    ['Maadi','Zamalek'],
      'Rehab City':     ['New Cairo','Madinaty'],
      'Madinaty':       ['New Cairo','Rehab City'],
    };

    const ALLOWED_SORT = ['createdAt', 'rating', 'expectedSalary', 'experienceYears'];
    const sortField = ALLOWED_SORT.includes(sort) ? sort : 'createdAt';

    // Fetch all matching maids (no skip/limit yet — sort in JS for area priority)
    const allMaids = await Maid.find(filter)
      .populate('user', 'name email lastSeen')
      .sort({ [sortField]: -1 });

    // Smart area-based sort for housewife customers
    const customerArea = (req.user?.role === 'housewife')
      ? (await (async () => { const hw2 = await HouseWife.findOne({ user: req.user._id }).select('residentialArea'); return hw2?.residentialArea; })())
      : null;

    if (customerArea) {
      const nearby = NEARBY_MAP[customerArea] || [];
      allMaids.sort((a, b) => {
        const score = (m) => {
          if (m.areasServed?.includes(customerArea)) return 0;
          if (nearby.some(n => m.areasServed?.includes(n))) return 1;
          return 2;
        };
        const diff = score(a) - score(b);
        if (diff !== 0) return diff;
        return (b.rating || 0) - (a.rating || 0);
      });
    }

    const total = allMaids.length;
    const maids = allMaids.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

    // Increment view counts (batch)
    const maidIds = maids.map(m => m._id);
    await Maid.updateMany({ _id: { $in: maidIds } }, { $inc: { 'stats.views': 1 } });

    res.json({
      success: true,
      maids,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Single Maid ──
exports.getMaid = async (req, res) => {
  try {
    const maid = await Maid.findById(req.params.id).populate('user', 'name email lastSeen avatar');
    if (!maid) return res.status(404).json({ success: false, message: 'Maid not found' });
    await Maid.findByIdAndUpdate(req.params.id, { $inc: { 'stats.views': 1 } });
    res.json({ success: true, maid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── My Profile (maid) ──
exports.getMyProfile = async (req, res) => {
  try {
    const maid = await Maid.findOne({ user: req.user._id });
    if (!maid) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, maid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Like / Unlike Maid ──
exports.toggleLike = async (req, res) => {
  try {
    const hwProfile = await HouseWife.findOne({ user: req.user._id });
    if (!hwProfile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const maidId = req.params.id;
    const alreadyLiked = hwProfile.savedMaids.includes(maidId);

    if (alreadyLiked) {
      hwProfile.savedMaids.pull(maidId);
      await Maid.findByIdAndUpdate(maidId, { $inc: { 'stats.likes': -1 } });
    } else {
      hwProfile.savedMaids.push(maidId);
      await Maid.findByIdAndUpdate(maidId, { $inc: { 'stats.likes': 1 } });

      // Notify maid
      const maidDoc = await Maid.findById(maidId).populate('user');
      await Notification.create({
        user: maidDoc.user._id,
        type: 'like',
        title: 'Someone liked your profile!',
        body: 'A house wife has liked your profile. You may receive a chat request.'
      });
    }

    await hwProfile.save();
    res.json({ success: true, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Saved Maids (housewife) ──
exports.getSavedMaids = async (req, res) => {
  try {
    const hw = await HouseWife.findOne({ user: req.user._id }).populate({
      path: 'savedMaids',
      populate: { path: 'user', select: 'name lastSeen' }
    });
    res.json({ success: true, maids: hw?.savedMaids || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Submit Passport / National ID + Selfie for Verification ──
exports.submitVerification = async (req, res) => {
  try {
    const { passportNumber, nationalId, passportPhotoUrl, passportPhotoPublicId, residencePermitUrl, selfieUrl, selfiePublicId } = req.body;
    const maid = await Maid.findOne({ user: req.user._id });
    if (!maid) return res.status(404).json({ success: false, message: 'Profile not found' });

    if (residencePermitUrl) {
      maid.residencePermit = { url: residencePermitUrl, submittedAt: new Date() };
    }

    if (nationalId) {
      maid.nationalId = nationalId;
    } else {
      maid.passport = {
        number: passportNumber,
        photo: { url: passportPhotoUrl, publicId: passportPhotoPublicId },
        submittedAt: new Date()
      };
    }
    maid.selfie = {
      photo: { url: selfieUrl, publicId: selfiePublicId },
      submittedAt: new Date()
    };
    maid.verificationStatus = 'pending';
    // Allow rejected maids to re-enter the review queue
    if (maid.approvalStatus === 'rejected') maid.approvalStatus = 'pending';
    await maid.save();

    // Notify admins (create a system notification)
    await Notification.create({
      user: req.user._id, type: 'system',
      title: '📋 Verification Submitted',
      body: 'Your passport and selfie have been submitted. We will review within 24 hours.'
    });

    res.json({ success: true, maid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Submit Review (housewife only, must have hired the maid) ──
exports.submitReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const maidId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1–5' });
    }

    const { HouseWife, Review } = require('../models/index');

    const hw = await HouseWife.findOne({ user: req.user._id });
    const wasHired = hw?.hiredMaids?.some(h => h.maid.toString() === maidId);
    if (!wasHired) {
      return res.status(403).json({ success: false, message: 'You can only review a maid you have hired' });
    }

    // Upsert — one review per housewife per maid
    const review = await Review.findOneAndUpdate(
      { maid: maidId, housewife: req.user._id },
      { rating, comment, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Recalculate average rating on the maid document
    const allReviews = await Review.find({ maid: maidId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Maid.findByIdAndUpdate(maidId, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: allReviews.length
    });

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Reviews for a Maid ──
exports.getMaidReviews = async (req, res) => {
  try {
    const { Review } = require('../models/index');
    const reviews = await Review.find({ maid: req.params.id })
      .populate('housewife', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Maid submits offline payment receipt ──
exports.requestOfflinePayment = async (req, res) => {
  try {
    const { receiptUrl, receiptPublicId, plan = 'monthly' } = req.body;
    if (!receiptUrl) return res.status(400).json({ success: false, message: 'Receipt image is required' });

    const maid = await Maid.findOne({ user: req.user._id });
    if (!maid) return res.status(404).json({ success: false, message: 'Maid profile not found' });

    // Cancel any previous unconfirmed requests
    await Payment.updateMany(
      { maidProfile: maid._id, method: 'cash_transfer', status: 'pending' },
      { status: 'failed' }
    );

    const payment = await Payment.create({
      user: req.user._id,
      maidProfile: maid._id,
      type: 'subscription',
      method: 'cash_transfer',
      amount: getMaidPriceEGP(maid.nationality),
      status: 'pending',
      subscriptionPlan: plan,
      receiptUrl,
      receiptPublicId,
      adminNote: 'Maid submitted receipt — awaiting admin confirmation',
    });

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Add Photo to Maid Profile ──
exports.addPhoto = async (req, res) => {
  try {
    const { url, publicId } = req.body;
    const maid = await Maid.findOne({ user: req.user._id });
    if (!maid) return res.status(404).json({ success: false, message: 'Profile not found' });
    if (maid.photos.length >= 6) return res.status(400).json({ success: false, message: 'Max 6 photos allowed' });

    maid.photos.push({ url, publicId, isPrimary: maid.photos.length === 0 });
    await maid.save();
    res.json({ success: true, photos: maid.photos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete Photo ──
exports.deletePhoto = async (req, res) => {
  try {
    const maid = await Maid.findOne({ user: req.user._id });
    if (!maid) return res.status(404).json({ success: false, message: 'Profile not found' });
    if (maid.photos.length <= 3) return res.status(400).json({ success: false, message: 'Minimum 3 photos required' });

    maid.photos = maid.photos.filter(p => p._id.toString() !== req.params.photoId);
    await maid.save();
    res.json({ success: true, photos: maid.photos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Hire Requests (maid sees incoming requests) ──
exports.getHireRequests = async (req, res) => {
  try {
    const maid = await Maid.findOne({ user: req.user._id });
    if (!maid) return res.status(404).json({ success: false });

    const requests = await HireRequest.find({ maid: maid._id, status: 'pending' })
      .populate('housewife', 'name email phone')
      .populate('hwProfile', 'fullName city country residentialArea subscription')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Respond to Hire Request (maid approves or rejects) ──
exports.respondHireRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'action must be approve or reject' });
    }

    const request = await HireRequest.findById(req.params.id)
      .populate('housewife', 'name email fcmToken')
      .populate('maid');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    // Verify this request belongs to the authenticated maid
    const maid = await Maid.findOne({ user: req.user._id });
    if (!maid || String(request.maid._id) !== String(maid._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (action === 'approve') {
      // ── Monthly hire limit: max 2 per subscription month ──
      const currentMonth = new Date().toISOString().slice(0, 7);
      const mh = maid.monthlyHires || { count: 0, month: '' };
      const monthCount = mh.month === currentMonth ? mh.count : 0;
      if (monthCount >= 2) {
        return res.status(403).json({
          success: false,
          requiresResubscription: true,
          message: 'You have reached your 2-hire monthly limit. Please renew your subscription to accept more hires this month.',
        });
      }
    }

    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.respondedAt = new Date();
    await request.save();

    const hwUser = request.housewife;
    const maidName = maid.fullName;

    if (action === 'approve') {
      // Increment monthly hire count
      const currentMonth = new Date().toISOString().slice(0, 7);
      const mh = maid.monthlyHires || { count: 0, month: '' };
      const newCount = mh.month === currentMonth ? mh.count + 1 : 1;
      await Maid.findByIdAndUpdate(maid._id, { 'monthlyHires.count': newCount, 'monthlyHires.month': currentMonth });

      // Add maid to housewife's hiredMaids
      const alreadyHired = await HouseWife.findOne({
        user: hwUser._id,
        'hiredMaids.maid': maid._id
      });
      if (!alreadyHired) {
        await HouseWife.findOneAndUpdate(
          { user: hwUser._id },
          { $push: { hiredMaids: { maid: maid._id, commissionPaid: false, commissionAmount: 0 } } }
        );
      }
      // Mark maid unavailable and hired
      await Maid.findByIdAndUpdate(maid._id, { isAvailable: false, isHired: true });

      // Update chat if linked
      if (request.chatId) {
        const { Chat } = require('../models/index');
        await Chat.findByIdAndUpdate(request.chatId, { approvalStatus: 'hired' });
      }

      // Notify customer (in-app + push + email)
      await Notification.create({
        user: hwUser._id,
        type: 'hire_confirmed',
        title: '🎉 Hire Confirmed!',
        body: `${maidName} accepted your hire request!`,
      });
      await sendPush({
        token: hwUser.fcmToken,
        title: '🎉 Hire Confirmed!',
        body: `${maidName} accepted your hire request.`,
        data: { screen: 'Home' },
      });
      await sendEmail({
        to: hwUser.email,
        subject: `Hire Confirmed — ${maidName} accepted! — Servix`,
        html: hireApprovedEmailToCustomer(hwUser.name, maidName),
      });

      // Maid also gets in-app notification
      await Notification.create({
        user: req.user._id,
        type: 'hire_confirmed',
        title: '🎉 You\'re Hired!',
        body: `Congratulations! You accepted the hire request from ${hwUser.name}.`,
      });

      // Real-time: notify customer their hire was approved
      const ioApprove = req.app.get('io');
      if (ioApprove) ioApprove.to(`user_${hwUser._id}`).emit('hire_request_response', { action: 'approve', maidName });

      res.json({ success: true, action: 'approved' });

    } else {
      // Reject — block this maid from appearing to this housewife again
      await HouseWife.findOneAndUpdate(
        { user: hwUser._id },
        { $addToSet: { blockedMaids: maid._id } }
      );

      // Notify customer
      await Notification.create({
        user: hwUser._id,
        type: 'hire_rejected',
        title: 'Hire Request Declined',
        body: `${maidName} declined your hire request. Browse other maids to find the right fit.`,
      });
      await sendPush({
        token: hwUser.fcmToken,
        title: 'Hire Request Declined',
        body: `${maidName} declined your request.`,
        data: { screen: 'Browse' },
      });
      await sendEmail({
        to: hwUser.email,
        subject: `Hire Request Declined — Servix`,
        html: hireRejectedEmailToCustomer(hwUser.name, maidName),
      });

      // Real-time: notify customer their hire was rejected
      const ioReject = req.app.get('io');
      if (ioReject) ioReject.to(`user_${hwUser._id}`).emit('hire_request_response', { action: 'reject', maidName });

      res.json({ success: true, action: 'rejected' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
