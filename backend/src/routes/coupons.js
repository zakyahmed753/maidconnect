const express = require('express');
const router = express.Router();
const coupon = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/my-code',       protect, coupon.getMyCode);
router.post('/validate',     protect, coupon.validateCoupon);
router.get('/',              protect, adminOnly, coupon.listCoupons);
router.post('/',             protect, adminOnly, coupon.createCoupon);
router.put('/:id/toggle',    protect, adminOnly, coupon.toggleCoupon);

module.exports = router;
