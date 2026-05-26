const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { HouseWife, Notification, Chat } = require('../models/index');
const Maid = require('../models/Maid');

router.get('/me', protect, async (req, res) => {
  try {
    const hw = await HouseWife.findOne({ user: req.user._id })
      .populate({ path: 'savedMaids', populate: { path: 'user', select: 'name' } })
      .populate({ path: 'hiredMaids.maid', populate: { path: 'user', select: 'name' } });
    res.json({ success: true, profile: hw });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/me', protect, async (req, res) => {
  try {
    const hw = await HouseWife.findOneAndUpdate(
      { user: req.user._id }, req.body, { new: true }
    );
    res.json({ success: true, profile: hw });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /housewives/hire — direct hire, no commission
router.post('/hire', protect, async (req, res) => {
  try {
    const { maidProfileId, chatId } = req.body;
    if (!maidProfileId) return res.status(400).json({ success: false, message: 'maidProfileId required' });

    const maid = await Maid.findById(maidProfileId);
    if (!maid) return res.status(404).json({ success: false, message: 'Maid not found' });

    const hw = await HouseWife.findOne({ user: req.user._id });
    const alreadyHired = hw?.hiredMaids?.some(h => String(h.maid) === String(maidProfileId));
    if (!alreadyHired) {
      await HouseWife.findOneAndUpdate(
        { user: req.user._id },
        { $push: { hiredMaids: { maid: maidProfileId, commissionPaid: false, commissionAmount: 0 } } }
      );
    }

    // Mark maid unavailable so she won't appear in browse results
    await Maid.findByIdAndUpdate(maidProfileId, { isAvailable: false });

    if (chatId) {
      await Chat.findByIdAndUpdate(chatId, { approvalStatus: 'hired' });
    }

    await Notification.create({
      user: req.user._id,
      type: 'hire_confirmed',
      title: '🎉 Hire Confirmed!',
      body: `${maid.fullName} has been successfully hired.`,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
