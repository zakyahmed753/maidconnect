const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// ── Socket.IO (real-time chat) ──
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Attach io to app for use in controllers
app.set('io', io);

// ── Middleware ──
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// ── Routes ──
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/maids',    require('./routes/maids'));
app.use('/api/housewives', require('./routes/housewives'));
app.use('/api/chats',    require('./routes/chats'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/upload',   require('./routes/upload'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Socket.IO events ──
const socketHandler = require('./utils/socketHandler');
socketHandler(io);

// ── MongoDB Connection ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── Start Server ──
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MaidConnect API running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, io };
