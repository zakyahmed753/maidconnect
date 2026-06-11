const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Not configured — skipping:', subject, '→', to);
    return;
  }
  try {
    await transporter.sendMail({
      from: `Servix <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('[Email] Sent:', subject, '→', to);
  } catch (err) {
    console.error('[Email] Failed:', err.message);
  }
};

exports.sendOTPEmail = async (to, otp) => {
  await exports.sendEmail({
    to,
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

exports.sendResetEmail = async (to, code) => {
  await exports.sendEmail({
    to,
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
