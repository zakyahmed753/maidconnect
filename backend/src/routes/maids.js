const express = require('express');
const router = express.Router();
const mc = require('../controllers/maidController');
const { protect, maidOnly } = require('../middleware/auth');

router.get('/',                        protect, mc.getAllMaids);
router.get('/saved/list',              protect, mc.getSavedMaids);
router.get('/me',                      protect, maidOnly, mc.getMyProfile);
router.get('/hire-requests',           protect, maidOnly, mc.getHireRequests);
router.put('/hire-requests/:id/respond', protect, maidOnly, mc.respondHireRequest);
router.get('/:id',                     protect, mc.getMaid);
router.post('/',                       protect, maidOnly, mc.createProfile);
router.put('/me',                      protect, maidOnly, mc.updateProfile);
router.post('/me/photos',              protect, maidOnly, mc.addPhoto);
router.post('/me/verification',        protect, maidOnly, mc.submitVerification);
router.delete('/me/photos/:photoId',   protect, maidOnly, mc.deletePhoto);
router.post('/:id/like',               protect, mc.toggleLike);
router.post('/:id/reviews',            protect, mc.submitReview);
router.get('/:id/reviews',             protect, mc.getMaidReviews);

module.exports = router;
