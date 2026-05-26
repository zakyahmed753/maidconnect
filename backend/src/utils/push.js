const axios = require('axios');

exports.sendPush = async ({ token, title, body, data = {} }) => {
  if (!token || !token.startsWith('ExponentPushToken')) return;
  try {
    const res = await axios.post('https://exp.host/api/v2/push/send', {
      to: token,
      title,
      body,
      data,
      sound: 'default',
      priority: 'high',
      channelId: 'default',
    }, { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } });
    const ticket = res.data?.data;
    if (ticket?.status === 'error') console.error('[Push] Ticket error:', ticket.message);
  } catch (err) {
    console.error('[Push] Failed:', err.message);
  }
};
