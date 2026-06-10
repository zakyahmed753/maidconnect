const { Chat, Message, Notification } = require('../models/index');
const Maid = require('../models/Maid');

// ── Get or Create Chat ──
exports.getOrCreateChat = async (req, res) => {
  try {
    const { maidUserId, maidProfileId } = req.body;

    // Gate: housewife must have active subscription
    if (req.user.role === 'housewife') {
      const { HouseWife } = require('../models/index');
      const hw = await HouseWife.findOne({ user: req.user._id });
      const sub = hw?.subscription;
      if (!sub || sub.status !== 'active' || !sub.endDate || new Date(sub.endDate) < new Date()) {
        // Expire if past end date
        if (sub && sub.status === 'active' && sub.endDate && new Date(sub.endDate) < new Date()) {
          await HouseWife.findOneAndUpdate({ user: req.user._id }, { 'subscription.status': 'expired' });
        }
        return res.status(403).json({ success: false, message: 'subscription_required', code: 'SUBSCRIPTION_REQUIRED' });
      }
    }

    let chat = await Chat.findOne({
      housewife: req.user._id,
      maid: maidUserId
    }).populate('maid', 'name avatar lastSeen').populate('lastMessage');

    // Gate: block NEW chat creation when a replacement fee is owed
    if (!chat && req.user.role === 'housewife') {
      const { HouseWife } = require('../models/index');
      const hw2 = await HouseWife.findOne({ user: req.user._id });
      if (
        hw2?.freeVacancy?.available &&
        hw2.freeVacancy.penaltyAmount > 0 &&
        new Date(hw2.freeVacancy.expiresAt) > new Date()
      ) {
        return res.status(403).json({
          success: false,
          code: 'REPLACEMENT_FEE_REQUIRED',
          penaltyAmount: hw2.freeVacancy.penaltyAmount,
          message: 'Pay your replacement fee before starting new chats.',
        });
      }
    }

    if (!chat) {
      chat = await Chat.create({
        housewife: req.user._id,
        maid: maidUserId,
        maidProfile: maidProfileId
      });
      await Maid.findByIdAndUpdate(maidProfileId, { $inc: { 'stats.chats': 1 } });

      // Notify maid
      await Notification.create({
        user: maidUserId,
        type: 'chat',
        title: 'New chat request!',
        body: 'A house wife wants to chat with you.',
        data: { chatId: chat._id }
      });
    }

    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get My Chats ──
exports.getMyChats = async (req, res) => {
  try {
    const query = req.user.role === 'housewife'
      ? { housewife: req.user._id }
      : { maid: req.user._id };

    const chats = await Chat.find(query)
      .populate('housewife', 'name avatar lastSeen')
      .populate('maid', 'name avatar lastSeen')
      .populate('maidProfile', 'fullName photos rating')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Messages ──
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Mark messages as read
    await Message.updateMany(
      { chat: chatId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true, readAt: Date.now() }
    );

    res.json({ success: true, messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Send Text Message ──
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content, type = 'text', voiceUrl, voiceDuration, imageUrl } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    // Verify participant
    const isParticipant = chat.housewife.equals(req.user._id) || chat.maid.equals(req.user._id);
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not a participant' });

    const message = await Message.create({
      chat: chatId, sender: req.user._id,
      type, content, voiceUrl, voiceDuration, imageUrl
    });

    // Update chat's last message
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      lastMessageAt: Date.now()
    });

    const populated = await Message.findById(message._id).populate('sender', 'name avatar role');

    // Emit via Socket.IO — to chat room (both users inside ChatScreen) AND to recipient's personal room (for list updates)
    const io = req.app.get('io');
    io.to(`chat_${chatId}`).emit('new_message', populated);
    const recipientId = chat.housewife.equals(req.user._id) ? chat.maid : chat.housewife;
    io.to(`user_${recipientId}`).emit('new_chat_message', { chatId, message: populated });
    await Notification.create({
      user: recipientId,
      type: 'chat',
      title: `New ${type === 'voice' ? 'voice note' : 'message'}`,
      body: type === 'voice' ? '🎙 Voice note received' : content?.substring(0, 60),
      data: { chatId }
    });

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update Approval Status ──
exports.updateApprovalStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { status } = req.body; // 'interview','approved','rejected','hired'

    const chat = await Chat.findByIdAndUpdate(chatId, { approvalStatus: status }, { new: true });

    if (status === 'approved') {
      const io = req.app.get('io');
      io.to(`chat_${chatId}`).emit('approval_updated', { status, chatId });
    }

    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
