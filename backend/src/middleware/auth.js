const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (user.isSuspended) return res.status(403).json({ success: false, message: 'Account suspended' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

const maidOnly = (req, res, next) => {
  if (req.user?.role !== 'maid') {
    return res.status(403).json({ success: false, message: 'Maid access required' });
  }
  next();
};

const housewifeOnly = (req, res, next) => {
  if (req.user?.role !== 'housewife') {
    return res.status(403).json({ success: false, message: 'House wife access required' });
  }
  next();
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

module.exports = { protect, adminOnly, maidOnly, housewifeOnly, generateToken };
