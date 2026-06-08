const express = require('express');
const router = express.Router();
const ac = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/dashboard',                protect, adminOnly, ac.getDashboard);
router.get('/maids',                    protect, adminOnly, ac.getAllMaids);
router.get('/maids/:id',               protect, adminOnly, ac.getMaid);
router.put('/maids/:id/status',         protect, adminOnly, ac.updateMaidStatus);
router.put('/maids/:id/subscription',        protect, adminOnly, ac.activateSubscription);
router.post('/maids/:id/offline-payment',    protect, adminOnly, ac.offlinePayment);
router.put('/maids/:id/verify',              protect, adminOnly, ac.verifyIdentity);
router.put('/maids/:id/hired',               protect, adminOnly, ac.toggleHired);
router.get('/housewives',                    protect, adminOnly, ac.getAllHouseWives);
router.put('/users/:userId/suspend',         protect, adminOnly, ac.toggleSuspend);
router.put('/users/:userId/delete',          protect, adminOnly, ac.softDeleteUser);
router.put('/users/:userId/restore',         protect, adminOnly, ac.restoreUser);
router.get('/payments',                      protect, adminOnly, ac.getPayments);
router.post('/payments/reject-offline',      protect, adminOnly, ac.rejectOfflinePayment);
router.post('/broadcast',                    protect, adminOnly, ac.broadcastNotification);

module.exports = router;
