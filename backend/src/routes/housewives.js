const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { HouseWife } = require('../models/index');

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

module.exports = router;
