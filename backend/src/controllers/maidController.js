const Maid = require('../models/Maid');
const User = require('../models/User');
const { HouseWife, Notification } = require('../models/index');

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
      minAge, maxAge, minExp, isAvailable,
      page = 1, limit = 20, sort = 'createdAt'
    } = req.query;

    const filter = {
      approvalStatus: 'approved',
    };

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

    const total = await Maid.countDocuments(filter);
    const maids = await Maid.find(filter)
      .populate('user', 'name email lastSeen')
      .sort({ [sort]: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Increment view counts (batch)
    const maidIds = maids.map(m => m._id);
    await Maid.updateMany({ _id: { $in: maidIds } }, { $inc: { 'stats.views': 1 } });

    res.json({
      success: true,
      maids,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
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
