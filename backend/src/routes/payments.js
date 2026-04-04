const express = require('express');
const router = express.Router();
const pc = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/fawry',          protect, pc.initFawry);
router.post('/vodafone-cash',  protect, pc.initVodafoneCash);
router.post('/instapay',       protect, pc.initInstaPay);
router.post('/amazon-pay',     protect, pc.initAmazonPay);
router.post('/callback',       pc.paymentCallback);
router.get('/history',         protect, pc.getHistory);
router.get('/:id/status',      protect, pc.checkStatus);

module.exports = router;
