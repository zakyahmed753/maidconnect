const express = require('express');
const router = express.Router();
const cc = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/start',                   protect, cc.getOrCreateChat);
router.get('/',                         protect, cc.getMyChats);
router.get('/:chatId/messages',         protect, cc.getMessages);
router.post('/message',                 protect, cc.sendMessage);
router.put('/:chatId/approval',         protect, cc.updateApprovalStatus);

module.exports = router;
