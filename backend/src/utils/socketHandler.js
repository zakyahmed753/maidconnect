const jwt = require('jsonwebtoken');
module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (e) { next(new Error('Invalid token')); }
  });
  io.on('connection', (socket) => {
    socket.join(`user_${socket.userId}`);
    socket.on('join_chat',  (chatId) => socket.join(`chat_${chatId}`));
    socket.on('leave_chat', (chatId) => socket.leave(`chat_${chatId}`));
    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(`chat_${chatId}`).emit('user_typing', { userId: socket.userId, isTyping });
    });
    socket.on('disconnect', () => console.log('🔌 disconnected:', socket.userId));
  });
};
