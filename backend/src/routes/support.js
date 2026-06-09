const express = require('express');
const router = express.Router();
const { protect, adminOnly, adminOrAgent } = require('../middleware/auth');
const { SupportTicket } = require('../models/index');
const User = require('../models/User');

// ── Create ticket (authenticated users) ──
router.post('/', protect, async (req, res) => {
  try {
    const { subject, message, priority } = req.body;
    if (!subject || !message) return res.status(400).json({ success: false, message: 'Subject and message are required' });

    const user = await User.findById(req.user._id);
    const ticket = await SupportTicket.create({
      user: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      subject,
      message,
      priority: priority || 'medium',
    });

    // Optional: forward to Discord webhook if configured
    if (process.env.SUPPORT_DISCORD_WEBHOOK) {
      const payload = {
        embeds: [{
          title: `🎫 New Support Ticket #${ticket._id.toString().slice(-6).toUpperCase()}`,
          color: user.role === 'maid' ? 0xC9A84C : 0x2E7D5E,
          fields: [
            { name: 'From', value: `${user.name} (${user.role})`, inline: true },
            { name: 'Email', value: user.email, inline: true },
            { name: 'Subject', value: subject },
            { name: 'Message', value: message.slice(0, 1000) },
            { name: 'Priority', value: priority || 'medium', inline: true },
          ],
          timestamp: new Date().toISOString(),
        }]
      };
      fetch(process.env.SUPPORT_DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Get own tickets ──
router.get('/mine', protect, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin/Agent: list all tickets ──
router.get('/', protect, adminOrAgent, async (req, res) => {
  try {
    const { status, role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await SupportTicket.countDocuments(filter);
    res.json({ success: true, tickets, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin/Agent: update ticket status / notes ──
router.put('/:id', protect, adminOrAgent, async (req, res) => {
  try {
    const { status, priority, adminNotes } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status, priority, adminNotes, updatedAt: Date.now() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
