const { Resend } = require('resend');

const FROM_ADDRESS = process.env.EMAIL_FROM || 'Servix <noreply@servix.world>';

exports.sendEmail = async ({ to, subject, html, throwOnError = false }) => {
  if (!process.env.RESEND_API_KEY) {
    const msg = 'RESEND_API_KEY not set';
    console.warn('[Email] Skipping — ' + msg, subject, '→', to);
    if (throwOnError) throw new Error(msg);
    return;
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
    if (error) throw new Error(error.message);
    console.log('[Email] Sent:', subject, '→', to);
  } catch (err) {
    console.error('[Email] Failed:', err.message);
    if (throwOnError) throw err;
  }
};

exports.sendOTPEmail = async (to, otp, { throwOnError = false } = {}) => {
  await exports.sendEmail({
    to,
    throwOnError,
    subject: 'Servix — Verify Your Email',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#fffcf5;border-radius:12px;border:1px solid #e8dcc8">
        <h2 style="color:#1a1108;margin-bottom:8px">Verify your email</h2>
        <p style="color:#6b5b45;margin-bottom:24px">Use this code to complete your Servix registration. Expires in <strong>10 minutes</strong>.</p>
        <div style="background:#1a1108;color:#c9a84c;font-size:38px;font-weight:700;letter-spacing:14px;text-align:center;padding:22px 0;border-radius:8px">${otp}</div>
        <p style="color:#a08060;font-size:12px;margin-top:20px">If you didn't create a Servix account, ignore this email.</p>
      </div>
    `,
  });
};

exports.sendResetEmail = async (to, code, { throwOnError = false } = {}) => {
  await exports.sendEmail({
    to,
    throwOnError,
    subject: 'Servix — Reset Your Password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#fffcf5;border-radius:12px;border:1px solid #e8dcc8">
        <h2 style="color:#1a1108;margin-bottom:8px">Reset your password</h2>
        <p style="color:#6b5b45;margin-bottom:24px">Use this code in the Servix app to reset your password. Expires in <strong>15 minutes</strong>.</p>
        <div style="background:#1a1108;color:#c9a84c;font-size:38px;font-weight:700;letter-spacing:14px;text-align:center;padding:22px 0;border-radius:8px">${code}</div>
        <p style="color:#a08060;font-size:12px;margin-top:20px">If you didn't request a password reset, ignore this email.</p>
      </div>
    `,
  });
};

exports.sendProfileApprovedEmail = async (to, maidName) => {
  await exports.sendEmail({
    to,
    subject: '✅ Your Servix Profile Has Been Approved!',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0a0a0a;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#0d2e1a,#1a3d25);padding:32px 28px;text-align:center">
          <div style="font-size:52px;margin-bottom:12px">🎉✅🌟</div>
          <h1 style="color:#5dd6a8;font-size:26px;margin:0;letter-spacing:1px">Congratulations! You're Approved!</h1>
          <p style="color:rgba(93,214,168,0.65);font-size:13px;margin:10px 0 0">Your Servix profile is verified & ready 🙌</p>
        </div>
        <div style="padding:28px;background:#111">
          <p style="color:#e0d0b0;font-size:15px;line-height:1.6">Hi <strong style="color:#5dd6a8">${maidName}</strong>, 👋</p>
          <p style="color:#b0a080;font-size:14px;line-height:1.8">
            🎊 Congratulations! Your profile has been <strong style="color:#5dd6a8">reviewed and approved</strong> by the Servix team.
            You are now a verified maid on our platform 💪 — families will be able to find you and reach out directly through the app.
          </p>
          <div style="background:#0d1f15;border:1px solid #1e4d30;border-radius:8px;padding:18px;margin:22px 0">
            <p style="color:#5dd6a8;font-size:13px;font-weight:700;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px">What happens next?</p>
            <p style="color:#a0c8b0;font-size:13px;margin:0;line-height:1.7">
              Servix officially launches on <strong style="color:#5dd6a8">1 July 2026</strong> — the app will be available on the <strong style="color:#5dd6a8">App Store & Google Play</strong> from that date.
              Your profile will go live immediately on launch day so families can find you right away.
            </p>
          </div>
          <div style="text-align:center;margin:24px 0">
            <a href="https://servix.world" style="display:inline-block;background:linear-gradient(135deg,#c9a84c,#e8c97a);color:#1a1108;font-weight:700;font-size:14px;padding:13px 32px;border-radius:6px;text-decoration:none;letter-spacing:0.5px">
              Open Servix
            </a>
          </div>
          <p style="color:#706050;font-size:12px;margin-top:20px">
            Keep your profile updated and respond to hire requests promptly to maximise your chances of getting hired.
          </p>
        </div>
        <div style="padding:16px 28px;background:#0a0a0a;text-align:center">
          <p style="color:#504030;font-size:11px;margin:0">Servix — Domestic Staffing Platform · servix.world</p>
        </div>
      </div>
    `,
  });
};

exports.sendProfileRejectedEmail = async (to, maidName, reason) => {
  await exports.sendEmail({
    to,
    subject: 'Servix — Profile Review Update',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0a0a0a;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#2e0d0d,#1a0808);padding:32px 28px;text-align:center">
          <div style="font-size:52px;margin-bottom:12px">📋</div>
          <h1 style="color:#f0a050;font-size:24px;margin:0">Profile Needs Attention</h1>
          <p style="color:rgba(240,160,80,0.6);font-size:13px;margin:10px 0 0">Action required on your Servix profile</p>
        </div>
        <div style="padding:28px;background:#111">
          <p style="color:#e0d0b0;font-size:15px;line-height:1.6">Hi <strong style="color:#f0a050">${maidName}</strong>,</p>
          <p style="color:#b0a080;font-size:14px;line-height:1.8">
            Thank you for registering on Servix. After reviewing your profile, our team was unable to approve it at this time.
          </p>
          ${reason ? `
          <div style="background:#1f100a;border:1px solid #4d2010;border-radius:8px;padding:16px;margin:20px 0">
            <p style="color:#f0a050;font-size:12px;font-weight:700;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px">Reason</p>
            <p style="color:#c8a080;font-size:13px;margin:0;line-height:1.7">${reason}</p>
          </div>
          ` : ''}
          <p style="color:#b0a080;font-size:14px;line-height:1.8">
            You can log in to the Servix app, update your profile or resubmit your documents, and our team will review it again.
          </p>
          <div style="text-align:center;margin:24px 0">
            <a href="https://servix.world" style="display:inline-block;background:linear-gradient(135deg,#c9a84c,#e8c97a);color:#1a1108;font-weight:700;font-size:14px;padding:13px 32px;border-radius:6px;text-decoration:none;letter-spacing:0.5px">
              Update My Profile
            </a>
          </div>
          <p style="color:#706050;font-size:12px;margin-top:20px">
            If you have questions, reply to this email or contact us through the app.
          </p>
        </div>
        <div style="padding:16px 28px;background:#0a0a0a;text-align:center">
          <p style="color:#504030;font-size:11px;margin:0">Servix — Domestic Staffing Platform · servix.world</p>
        </div>
      </div>
    `,
  });
};

exports.hireRequestEmail = (maidName, customerName) => `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0a0a0a;border-radius:12px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#3d2203,#1a1108);padding:32px 28px;text-align:center">
    <div style="font-size:48px;margin-bottom:12px">👑</div>
    <h1 style="color:#e8c97a;font-size:24px;margin:0;letter-spacing:1px">Hire Request!</h1>
    <p style="color:rgba(232,201,122,0.6);font-size:13px;margin:8px 0 0">You have a new hire request on Servix</p>
  </div>
  <div style="padding:28px;background:#111">
    <p style="color:#e0d0b0;font-size:15px;line-height:1.6">
      Hi <strong style="color:#e8c97a">${maidName}</strong>,
    </p>
    <p style="color:#b0a080;font-size:14px;line-height:1.7">
      <strong style="color:#e8c97a">${customerName}</strong> has sent you a hire request through the Servix app.
      Please open the app to review and respond.
    </p>
    <div style="background:#1a1108;border:1px solid #3d2203;border-radius:8px;padding:16px;margin:20px 0;text-align:center">
      <p style="color:#e8c97a;font-size:13px;margin:0;letter-spacing:0.5px">Open Servix to Approve or Reject</p>
    </div>
    <p style="color:#706050;font-size:12px;margin-top:24px">
      If you approve, you will be officially hired and your profile will be marked unavailable.
      If you reject, you will not be shown to this customer again.
    </p>
  </div>
  <div style="padding:16px 28px;background:#0a0a0a;text-align:center">
    <p style="color:#504030;font-size:11px;margin:0">Servix — Domestic Staffing Platform</p>
  </div>
</div>
`;

exports.hireApprovedEmailToCustomer = (customerName, maidName) => `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0a0a0a;border-radius:12px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#0d2e1a,#1a3d25);padding:32px 28px;text-align:center">
    <div style="font-size:48px;margin-bottom:12px">🎉</div>
    <h1 style="color:#5dd6a8;font-size:24px;margin:0">Hire Confirmed!</h1>
    <p style="color:rgba(93,214,168,0.6);font-size:13px;margin:8px 0 0">Your hire request was accepted</p>
  </div>
  <div style="padding:28px;background:#111">
    <p style="color:#e0d0b0;font-size:15px;line-height:1.6">
      Hi <strong style="color:#5dd6a8">${customerName}</strong>,
    </p>
    <p style="color:#b0a080;font-size:14px;line-height:1.7">
      Great news! <strong style="color:#5dd6a8">${maidName}</strong> has accepted your hire request.
      She is now officially hired and her profile has been marked as unavailable.
    </p>
    <p style="color:#706050;font-size:12px;margin-top:24px">
      You can contact her through the chat in the Servix app.
    </p>
  </div>
  <div style="padding:16px 28px;background:#0a0a0a;text-align:center">
    <p style="color:#504030;font-size:11px;margin:0">Servix — Domestic Staffing Platform</p>
  </div>
</div>
`;

exports.sendReferralEmail = async (to, maidName, refCode) => {
  const link = `https://servix.world/register?mref=${refCode}`;
  await exports.sendEmail({
    to,
    subject: '🔗 Your Servix Referral Link',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0a0a0a;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#3d2203,#1a1108);padding:32px 28px;text-align:center">
          <div style="font-size:48px;margin-bottom:12px">🔗</div>
          <h1 style="color:#e8c97a;font-size:24px;margin:0">Your Referral Link</h1>
          <p style="color:rgba(232,201,122,0.6);font-size:13px;margin:8px 0 0">Share this with maid friends and earn rewards</p>
        </div>
        <div style="padding:28px;background:#111">
          <p style="color:#e0d0b0;font-size:15px;line-height:1.6">Hi <strong style="color:#e8c97a">${maidName}</strong>,</p>
          <p style="color:#b0a080;font-size:14px;line-height:1.8">
            Welcome to Servix! Share your personal referral link with maid friends. Every friend who registers and subscribes through your link earns you <strong style="color:#e8c97a">EGP 100 off</strong> your subscription.
          </p>
          <div style="background:#1a1108;border:1px solid rgba(201,168,76,0.3);border-radius:8px;padding:18px;margin:20px 0;text-align:center">
            <p style="color:#666;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Your Referral Link</p>
            <p style="color:#e8c97a;font-size:14px;font-weight:700;margin:0;word-break:break-all">${link}</p>
          </div>
          <div style="text-align:center;margin:24px 0">
            <a href="https://wa.me/?text=${encodeURIComponent('Join me on Servix — find domestic work in Egypt! Register here: ' + link)}" style="display:inline-block;background:linear-gradient(135deg,#c9a84c,#e8c97a);color:#1a1108;font-weight:700;font-size:14px;padding:13px 32px;border-radius:6px;text-decoration:none;letter-spacing:0.5px;margin-right:10px">
              Share on WhatsApp
            </a>
          </div>
          <p style="color:#706050;font-size:12px;margin-top:10px">
            You can also retrieve this link anytime at <a href="https://servix.world/my-link" style="color:#c9a84c">servix.world/my-link</a>
          </p>
        </div>
        <div style="padding:16px 28px;background:#0a0a0a;text-align:center">
          <p style="color:#504030;font-size:11px;margin:0">Servix — Domestic Staffing Platform · servix.world</p>
        </div>
      </div>
    `,
  });
};

exports.sendReferralCampaignEmail = async (to, maidName, refCode) => {
  const link = `https://servix.world/register?mref=${refCode}`;
  const waLink = `https://wa.me/?text=${encodeURIComponent('Join me on Servix — find domestic work in Egypt! Register here: ' + link)}`;
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#1a1108 0%,#3d2203 100%);border-radius:14px 14px 0 0;padding:40px 40px 32px;text-align:center;">
  <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(232,201,122,0.6);">SERVIX · MAID NETWORK</p>
  <h1 style="margin:0 0 10px;font-size:36px;font-weight:300;color:#fff8ee;letter-spacing:1px;">Your Free Month<br><span style="font-weight:700;color:#e8c97a;">Is Waiting 🎁</span></h1>
  <p style="margin:0;font-size:15px;color:rgba(255,248,238,0.7);line-height:1.6;">Refer 5 maid friends — and pay <strong style="color:#e8c97a;">EGP 0</strong> for your subscription</p>
</td></tr>
<tr><td style="background:#ffffff;padding:40px;">
  <p style="margin:0 0 24px;font-size:17px;color:#1a1108;">Hi <strong>${maidName}</strong> 👋</p>
  <p style="margin:0 0 28px;font-size:15px;color:#4a3a28;line-height:1.8;">We built Servix to help maids like you get hired faster and earn more. Now we want to grow <em>together</em> — and we're making it worth your time.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1108,#3d2203);border-radius:12px;margin-bottom:32px;">
  <tr><td style="padding:28px 30px;text-align:center;">
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;color:rgba(232,201,122,0.7);text-transform:uppercase;">The Deal</p>
    <p style="margin:0 0 12px;font-size:30px;font-weight:700;color:#e8c97a;line-height:1.2;">Refer 5 Maid Friends</p>
    <p style="margin:0 0 16px;font-size:17px;color:#fff8ee;">and your next month subscription is</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
      <tr>
        <td style="text-decoration:line-through;font-size:20px;color:rgba(255,248,238,0.4);padding-right:12px;">EGP 500</td>
        <td style="font-size:42px;font-weight:900;color:#e8c97a;line-height:1;">EGP 0</td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:rgba(232,201,122,0.7);">EGP 100 credit added for every friend who joins ✓</p>
  </td></tr></table>
  <p style="margin:0 0 16px;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8a6a40;">How It Works</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
    <tr><td style="padding:12px 0;border-bottom:1px solid #f0e8d8;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="width:36px;height:36px;background:#e8c97a;border-radius:50%;text-align:center;vertical-align:middle;font-weight:700;font-size:14px;color:#1a1108;">1</td>
        <td style="padding-left:16px;font-size:14px;color:#4a3a28;line-height:1.6;">Copy your personal referral link below</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:12px 0;border-bottom:1px solid #f0e8d8;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="width:36px;height:36px;background:#e8c97a;border-radius:50%;text-align:center;vertical-align:middle;font-weight:700;font-size:14px;color:#1a1108;">2</td>
        <td style="padding-left:16px;font-size:14px;color:#4a3a28;line-height:1.6;">Send it to <strong>5 maid friends</strong> on WhatsApp, Facebook, or in person</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:12px 0;border-bottom:1px solid #f0e8d8;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="width:36px;height:36px;background:#e8c97a;border-radius:50%;text-align:center;vertical-align:middle;font-weight:700;font-size:14px;color:#1a1108;">3</td>
        <td style="padding-left:16px;font-size:14px;color:#4a3a28;line-height:1.6;">Each friend who registers earns you <strong style="color:#c9a84c;">EGP 100 credit</strong></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:12px 0;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="width:36px;height:36px;background:#e8c97a;border-radius:50%;text-align:center;vertical-align:middle;font-weight:700;font-size:14px;color:#1a1108;">4</td>
        <td style="padding-left:16px;font-size:14px;color:#4a3a28;line-height:1.6;">5 friends = <strong style="color:#c9a84c;">EGP 500 credit</strong> — your subscription is <strong>completely FREE</strong> 🎉</td>
      </tr></table>
    </td></tr>
  </table>
  <p style="margin:0 0 10px;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8a6a40;">Your Personal Referral Link</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;border:2px solid #e8c97a;border-radius:8px;margin-bottom:20px;">
  <tr><td style="padding:16px 20px;font-size:13px;color:#1a1108;word-break:break-all;font-weight:600;">${link}</td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
  <tr>
    <td style="padding-right:8px;" width="50%"><a href="${link}" style="display:block;text-align:center;padding:14px 10px;background:linear-gradient(135deg,#e8c97a,#c9a84c);border-radius:8px;color:#1a1108;font-weight:700;font-size:14px;text-decoration:none;">📋 Copy &amp; Share Link</a></td>
    <td style="padding-left:8px;" width="50%"><a href="${waLink}" style="display:block;text-align:center;padding:14px 10px;background:linear-gradient(135deg,#128c3e,#25d366);border-radius:8px;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;">💬 Share on WhatsApp</a></td>
  </tr></table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffcf5;border:1px solid #f0e0b0;border-radius:10px;margin-bottom:28px;">
  <tr><td style="padding:20px 24px;">
    <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#1a1108;">Your progress to a FREE month:</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="font-size:13px;color:#4a3a28;padding:5px 0;">1 friend joined</td><td style="text-align:right;font-size:13px;color:#c9a84c;font-weight:700;">= EGP 100 off</td></tr>
      <tr><td style="font-size:13px;color:#4a3a28;padding:5px 0;">2 friends joined</td><td style="text-align:right;font-size:13px;color:#c9a84c;font-weight:700;">= EGP 200 off</td></tr>
      <tr><td style="font-size:13px;color:#4a3a28;padding:5px 0;">3 friends joined</td><td style="text-align:right;font-size:13px;color:#c9a84c;font-weight:700;">= EGP 300 off</td></tr>
      <tr><td style="font-size:13px;color:#4a3a28;padding:5px 0;">4 friends joined</td><td style="text-align:right;font-size:13px;color:#c9a84c;font-weight:700;">= EGP 400 off</td></tr>
      <tr><td colspan="2" style="padding:4px 0;border-top:1px dashed #e0d0b0;"></td></tr>
      <tr style="background:#e8f5ee;"><td style="font-size:15px;font-weight:700;color:#1a5c40;padding:10px;">5 friends joined 🎉</td><td style="text-align:right;font-size:15px;font-weight:700;color:#1a5c40;padding:10px;">= COMPLETELY FREE</td></tr>
    </table>
  </td></tr></table>
  <p style="margin:0 0 8px;font-size:14px;color:#4a3a28;line-height:1.8;">Retrieve your link anytime at <a href="https://servix.world/my-link" style="color:#c9a84c;font-weight:700;">servix.world/my-link</a></p>
  <p style="margin:24px 0 0;font-size:14px;color:#4a3a28;line-height:1.8;">Thank you for being part of Servix. Together we're building something that works for every maid in Egypt. 🙏</p>
  <p style="margin:16px 0 0;font-size:14px;color:#4a3a28;">Warm regards,<br><strong style="color:#1a1108;">The Servix Team</strong></p>
</td></tr>
<tr><td style="background:#1a1108;border-radius:0 0 14px 14px;padding:24px 40px;text-align:center;">
  <p style="margin:0 0 6px;font-size:13px;color:rgba(232,201,122,0.8);font-weight:700;">Servix — Trusted Domestic Work in Egypt</p>
  <p style="margin:0;font-size:11px;color:rgba(255,248,238,0.35);line-height:1.6;">Questions? Visit <a href="https://servix.world" style="color:rgba(232,201,122,0.6);">servix.world</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`;
  await exports.sendEmail({ to, subject: '🎁 Refer 5 Friends — Get Your Next Month FREE on Servix', html });
};

exports.hireRejectedEmailToCustomer = (customerName, maidName) => `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0a0a0a;border-radius:12px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#2e0d0d,#1a0808);padding:32px 28px;text-align:center">
    <div style="font-size:48px;margin-bottom:12px">😔</div>
    <h1 style="color:#e05555;font-size:24px;margin:0">Request Declined</h1>
    <p style="color:rgba(224,85,85,0.6);font-size:13px;margin:8px 0 0">Your hire request was not accepted</p>
  </div>
  <div style="padding:28px;background:#111">
    <p style="color:#e0d0b0;font-size:15px;line-height:1.6">
      Hi <strong style="color:#e05555">${customerName}</strong>,
    </p>
    <p style="color:#b0a080;font-size:14px;line-height:1.7">
      Unfortunately, <strong style="color:#e05555">${maidName}</strong> has declined your hire request.
      Browse other available maids in the Servix app to find the right fit.
    </p>
  </div>
  <div style="padding:16px 28px;background:#0a0a0a;text-align:center">
    <p style="color:#504030;font-size:11px;margin:0">Servix — Domestic Staffing Platform</p>
  </div>
</div>
`;
