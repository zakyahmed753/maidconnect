const express = require('express');
const router = express.Router();
const { protect, adminOnly, adminOrAgent } = require('../middleware/auth');
const { SupportTicket, Notification } = require('../models/index');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const { sendPush } = require('../utils/push');

// ── Create ticket ──
router.post('/', protect, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ success: false, message: 'Subject and message are required' });

    const user = await User.findById(req.user._id);
    const ticket = await SupportTicket.create({
      user: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      subject,
      message,
    });

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

// ── Admin/Agent: update ticket (status, notes, reply) ──
router.put('/:id', protect, adminOrAgent, async (req, res) => {
  try {
    const { status, adminNotes, adminReply } = req.body;

    const updateFields = { updatedAt: Date.now() };
    if (status)     updateFields.status     = status;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

    const isNewReply = adminReply && adminReply.trim();
    if (isNewReply) {
      updateFields.adminReply = adminReply.trim();
      updateFields.repliedAt  = new Date();
      // Admin replying counts as in_progress unless status explicitly set
      if (!status) updateFields.status = 'in_progress';
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    // ── Notify ticket owner when admin replies ──
    if (isNewReply) {
      const owner = await User.findById(ticket.user);
      if (owner) {
        // In-app notification
        const notifTitle = '💬 Support Reply';
        const notifBody  = `Your ticket "${ticket.subject.slice(0, 50)}" received a reply from support.`;
        await Notification.create({
          user:  owner._id,
          type:  'system',
          title: notifTitle,
          body:  notifBody,
          data:  { ticketId: ticket._id.toString() },
        }).catch(() => {});

        // Push notification
        if (owner.fcmToken) {
          push.sendPush({ token: owner.fcmToken, title: notifTitle, body: notifBody }).catch(() => {});
        }

        // Email notification
        const html = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f9f9f9;padding:30px;border-radius:8px">
            <div style="background:#0D3827;padding:20px;border-radius:6px 6px 0 0;text-align:center">
              <h1 style="color:#fff;font-size:22px;margin:0">Support Reply — Servix</h1>
            </div>
            <div style="background:#fff;padding:24px;border-radius:0 0 6px 6px">
              <p style="color:#333;font-size:15px">Hi <strong>${owner.name}</strong>,</p>
              <p style="color:#333;font-size:15px">Your support ticket has received a reply:</p>
              <div style="background:#f0f7f4;border-left:4px solid #0D3827;padding:14px;border-radius:4px;margin:16px 0">
                <p style="margin:0;font-size:13px;color:#666"><strong>Ticket:</strong> ${ticket.subject}</p>
              </div>
              <div style="background:#e8f4f1;border-radius:6px;padding:16px;margin:12px 0">
                <p style="margin:0;font-size:14px;color:#0D3827;font-style:italic">"${adminReply.trim()}"</p>
              </div>
              <p style="color:#666;font-size:13px">Open the Servix app to view the full conversation and respond if needed.</p>
              <p style="color:#999;font-size:12px;margin-top:24px">Servix Support Team</p>
            </div>
          </div>`;
        sendEmail({ to: owner.email, subject: `💬 Support Reply: ${ticket.subject}`, html }).catch(() => {});
      }
    }

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
