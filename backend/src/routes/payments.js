const express = require('express');
const router = express.Router();
const pc = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/paymob/initiate',   protect, pc.initiatePaymob);
router.post('/paymob/callback',   pc.paymobCallback);
router.post('/return-maid',       protect, pc.returnMaid);
router.get('/history',            protect, pc.getHistory);
router.get('/:id/status',         protect, pc.checkStatus);

module.exports = router;
