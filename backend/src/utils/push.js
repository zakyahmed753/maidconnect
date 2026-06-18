const axios = require('axios');
const mongoose = require('mongoose');

exports.sendPush = async ({ token, title, body, data = {}, userId = null }) => {
  if (!token || (!token.startsWith('ExponentPushToken') && !token.startsWith('ExpoPushToken'))) return;
  try {
    const res = await axios.post('https://exp.host/--/api/v2/push/send', {
      to: token,
      title,
      body,
      data,
      sound: 'default',
      priority: 'high',
      channelId: 'default',
    }, { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } });
    const ticket = res.data?.data;
    if (ticket?.status === 'error') {
      console.error('[Push] Ticket error:', ticket.details?.error, ticket.message);
      if (ticket.details?.error === 'DeviceNotRegistered' && userId) {
        const User = mongoose.model('User');
        await User.findByIdAndUpdate(userId, { fcmToken: null }).catch(() => {});
        console.log('[Push] Cleared stale token for user:', userId);
      }
    }
  } catch (err) {
    console.error('[Push] Failed:', err.message);
  }
};
