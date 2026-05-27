// Force Node.js to use Google DNS (fixes SRV lookup on restrictive ISPs)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
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

// ── CORS — must be first, before helmet or anything else ──
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
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
app.use('/api/support',  require('./routes/support'));
app.use('/api/coupons',  require('./routes/coupons'));

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
const PORT = process.env.PORT || 5001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MaidConnect API running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, io };
