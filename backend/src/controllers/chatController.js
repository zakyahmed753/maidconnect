const { Chat, Message, Notification, HouseWife, Payment } = require('../models/index');
const Maid = require('../models/Maid');
const User = require('../models/User');
const { sendPush } = require('../utils/push');

// Returns true if the customer has a valid paid subscription (not a free-period one)
async function customerHasPaidSub(userId) {
  const hw = await HouseWife.findOne({ user: userId });
  const sub = hw?.subscription;
  if (!sub || sub.status !== 'active' || !sub.endDate || new Date(sub.endDate) < new Date()) {
    if (sub?.status === 'active' && sub?.endDate && new Date(sub.endDate) < new Date()) {
      await HouseWife.findOneAndUpdate({ user: userId }, { 'subscription.status': 'expired' });
    }
    return false;
  }
  const realPaid = await Payment.findOne({
    user: userId,
    type: 'customer_subscription',
    status: 'completed',
    method: { $ne: 'free_period' },
  });
  return !!realPaid;
}

// ── Get or Create Chat ──
exports.getOrCreateChat = async (req, res) => {
  try {
    const { maidUserId, maidProfileId } = req.body;

    if (req.user.role === 'housewife') {
      if (!(await customerHasPaidSub(req.user._id))) {
        return res.status(403).json({ success: false, message: 'subscription_required', code: 'SUBSCRIPTION_REQUIRED' });
      }
    }

    let chat = await Chat.findOne({
      housewife: req.user._id,
      maid: maidUserId
    }).populate('maid', 'name avatar lastSeen').populate('lastMessage');

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
    if (req.user.role === 'housewife' && !(await customerHasPaidSub(req.user._id))) {
      return res.status(403).json({ success: false, chats: [], code: 'SUBSCRIPTION_REQUIRED' });
    }

    let query;
    if (req.user.role === 'housewife') {
      query = { housewife: req.user._id };
    } else {
      // Maid: if currently hired, only show chat with the customer who hired them
      const maidProfile = await Maid.findOne({ user: req.user._id });
      if (maidProfile?.isHired) {
        const hw = await HouseWife.findOne({ 'hiredMaids.maid': maidProfile._id });
        query = hw
          ? { maid: req.user._id, housewife: hw.user }
          : { maid: req.user._id };
      } else {
        query = { maid: req.user._id };
      }
    }

    const chats = await Chat.find({ ...query, isActive: { $ne: false } })
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

    if (req.user.role === 'housewife' && !(await customerHasPaidSub(req.user._id))) {
      return res.status(403).json({ success: false, message: 'subscription_required', code: 'SUBSCRIPTION_REQUIRED' });
    }

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

    // Emit via Socket.IO — to chat room AND to recipient's user room as fallback
    const io = req.app.get('io');
    io.to(`chat_${chatId}`).emit('new_message', populated);
    const recipientId = chat.housewife.equals(req.user._id) ? chat.maid : chat.housewife;
    io.to(`user_${recipientId}`).emit('new_chat_message', { chatId, message: populated });

    // Push notification so recipient is alerted even when app is in background
    const recipientUser = await User.findById(recipientId).select('fcmToken name');
    await sendPush({
      token: recipientUser?.fcmToken,
      title: req.user.name,
      body: type === 'voice' ? '🎙 Sent you a voice note' : content?.substring(0, 80),
      data: { chatId: String(chatId), screen: 'Chat' },
    });

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
