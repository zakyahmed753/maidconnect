const express = require('express');
const router = express.Router();
const ac = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/dashboard',                protect, adminOnly, ac.getDashboard);
router.get('/maids',                    protect, adminOnly, ac.getAllMaids);
router.put('/maids/:id/status',         protect, adminOnly, ac.updateMaidStatus);
router.put('/maids/:id/subscription',   protect, adminOnly, ac.activateSubscription);
router.put('/maids/:id/verify',         protect, adminOnly, ac.verifyIdentity);
router.put('/maids/:id/hired',          protect, adminOnly, ac.toggleHired);
router.get('/housewives',               protect, adminOnly, ac.getAllHouseWives);
router.put('/users/:userId/suspend',    protect, adminOnly, ac.toggleSuspend);
router.get('/payments',                 protect, adminOnly, ac.getPayments);
router.post('/broadcast',               protect, adminOnly, ac.broadcastNotification);

module.exports = router;
