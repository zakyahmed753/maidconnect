/**
 * Send the "customers are now browsing" launch email to all approved maids.
 *
 * Usage:
 *   node backend/scripts/send-launch-email.js          ← real send
 *   node backend/scripts/send-launch-email.js --dry-run ← preview only (no emails sent)
 */

// Load .env if it exists locally; env vars passed inline on the command line always take priority
require('dotenv').config({ path: require('path').join(__dirname, '../.env'), override: false });
const mongoose = require('mongoose');
const { Resend } = require('resend');

const DRY_RUN = process.argv.includes('--dry-run');
const DELAY_MS = 400; // pause between sends to respect rate limits

// ── Email HTML (personalised per maid) ──────────────────────────────────────
function buildEmailHtml(maidName) {
  const first = (maidName || 'there').split(' ')[0];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Customers Are Looking at Your Profile — Servix</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:28px 12px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr><td style="background:linear-gradient(160deg,#1a1108 0%,#3d2203 50%,#1a1108 100%);border-radius:14px 14px 0 0;padding:44px 40px 36px;text-align:center;">
    <div style="font-size:54px;margin-bottom:16px;line-height:1;">👀</div>
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(232,201,122,0.55);">SERVIX · BIG NEWS</p>
    <h1 style="margin:0 0 14px;font-size:32px;font-weight:700;color:#fff8ee;line-height:1.2;letter-spacing:-0.3px;">
      Customers Are Already<br/>
      <span style="color:#e8c97a;">Looking at Your Profile</span>
    </h1>
    <p style="margin:0;font-size:15px;color:rgba(255,248,238,0.6);line-height:1.7;max-width:420px;margin-left:auto;margin-right:auto;">
      Servix is now live — and Cairo families have started browsing verified helper profiles, including <strong style="color:rgba(255,248,238,0.85);">yours</strong>.
    </p>
  </td></tr>

  <!-- ALERT BANNER -->
  <tr><td style="background:#e8c97a;padding:14px 40px;text-align:center;">
    <p style="margin:0;font-size:14px;font-weight:700;color:#1a1108;letter-spacing:0.2px;">
      ⚡ Download the app now — so you don't miss a single hire request
    </p>
  </td></tr>

  <!-- BODY -->
  <tr><td style="background:#ffffff;padding:40px;">

    <p style="margin:0 0 22px;font-size:16px;color:#1a1108;line-height:1.5;">Hi ${first}, 👋</p>

    <p style="margin:0 0 18px;font-size:15px;color:#4a3a28;line-height:1.85;">
      We're writing with the news you've been waiting for. <strong style="color:#1a1108;">Servix has officially launched</strong> — and families across Cairo are now browsing helper profiles and looking for someone to hire.
    </p>

    <p style="margin:0 0 28px;font-size:15px;color:#4a3a28;line-height:1.85;">
      Your profile is <strong style="color:#c9a84c;">live and visible</strong> to customers in your area right now. When a family is ready to hire you, they'll send you a message directly through the app.
    </p>

    <!-- What this means -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1108,#2e1c08);border-radius:12px;margin-bottom:32px;">
    <tr><td style="padding:26px 28px;">
      <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(232,201,122,0.6);">What this means for you</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:9px 0;border-bottom:1px solid rgba(232,201,122,0.1);">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:28px;font-size:18px;vertical-align:top;padding-top:1px;">🔍</td>
            <td style="padding-left:12px;font-size:14px;color:#d4c0a0;line-height:1.6;">Customers can see your photos, skills, and experience right now</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:9px 0;border-bottom:1px solid rgba(232,201,122,0.1);">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:28px;font-size:18px;vertical-align:top;padding-top:1px;">💬</td>
            <td style="padding-left:12px;font-size:14px;color:#d4c0a0;line-height:1.6;">When they want to hire you, they'll message you <strong style="color:#e8c97a;">directly in the app</strong></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:9px 0;border-bottom:1px solid rgba(232,201,122,0.1);">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:28px;font-size:18px;vertical-align:top;padding-top:1px;">⚡</td>
            <td style="padding-left:12px;font-size:14px;color:#d4c0a0;line-height:1.6;">Helpers who respond <strong style="color:#e8c97a;">quickly</strong> get hired more — speed matters</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:9px 0;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:28px;font-size:18px;vertical-align:top;padding-top:1px;">💰</td>
            <td style="padding-left:12px;font-size:14px;color:#d4c0a0;line-height:1.6;">You keep <strong style="color:#e8c97a;">100% of your salary</strong> — Servix takes zero commission</td>
          </tr></table>
        </td></tr>
      </table>
    </td></tr></table>

    <!-- Tips -->
    <p style="margin:0 0 14px;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8a6a40;">Quick tips to get hired faster</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;border:1px solid #ede3d0;border-radius:10px;margin-bottom:32px;">
    <tr><td style="padding:20px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:7px 0;font-size:14px;color:#4a3a28;line-height:1.6;">
          <span style="color:#c9a84c;font-weight:700;margin-right:8px;">01</span> Make sure your <strong>profile photo</strong> is clear and shows your face
        </td></tr>
        <tr><td style="padding:7px 0;font-size:14px;color:#4a3a28;line-height:1.6;border-top:1px solid #ede3d0;">
          <span style="color:#c9a84c;font-weight:700;margin-right:8px;">02</span> Keep your <strong>skills and experience</strong> up to date in your profile
        </td></tr>
        <tr><td style="padding:7px 0;font-size:14px;color:#4a3a28;line-height:1.6;border-top:1px solid #ede3d0;">
          <span style="color:#c9a84c;font-weight:700;margin-right:8px;">03</span> Turn on <strong>notifications</strong> so you never miss a message
        </td></tr>
        <tr><td style="padding:7px 0;font-size:14px;color:#4a3a28;line-height:1.6;border-top:1px solid #ede3d0;">
          <span style="color:#c9a84c;font-weight:700;margin-right:8px;">04</span> Reply to hire requests <strong>as fast as possible</strong> — first reply often wins
        </td></tr>
      </table>
    </td></tr></table>

    <!-- Download -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0d2e1a,#0b1f12);border-radius:12px;margin-bottom:12px;">
    <tr><td style="padding:28px 30px;text-align:center;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(93,214,168,0.6);">GET THE APP NOW</p>
      <p style="margin:0 0 22px;font-size:20px;font-weight:700;color:#fff;line-height:1.3;">Don't Miss Your<br/>Next Hire Request</p>

      <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
      <tr><td>
        <a href="https://apps.apple.com/app/id6782191284"
           style="display:inline-block;background:#ffffff;color:#111;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;">
          🍏&nbsp; <span style="font-size:10px;font-weight:400;opacity:.55;text-transform:uppercase;letter-spacing:.8px;">Download on the</span><br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="font-size:17px;font-weight:700;">App Store</span>
        </a>
      </td></tr></table>

      <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr><td>
        <a href="https://play.google.com/store/apps/details?id=app.servix.world"
           style="display:inline-block;background:#5dd6a8;color:#0d2e1a;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;">
          🤖&nbsp; <span style="font-size:10px;font-weight:400;opacity:.65;text-transform:uppercase;letter-spacing:.8px;">Get it on</span><br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="font-size:17px;font-weight:700;">Google Play</span>
        </a>
      </td></tr></table>
    </td></tr></table>

    <p style="margin:0 0 28px;font-size:12px;color:#b0a080;text-align:center;">
      Servix is free to download · Available on iPhone, iPad &amp; Android
    </p>

    <p style="margin:0 0 18px;font-size:15px;color:#4a3a28;line-height:1.85;">
      This is the moment you've been working toward. Your profile is approved, customers are looking, and all you need to do is <strong style="color:#1a1108;">be there when they reach out</strong>.
    </p>

    <p style="margin:0 0 28px;font-size:15px;color:#4a3a28;line-height:1.85;">We're rooting for you. 🙏</p>

    <p style="margin:0;font-size:15px;color:#4a3a28;">
      Warm regards,<br/>
      <strong style="color:#1a1108;font-size:16px;">The Servix Team</strong><br/>
      <span style="font-size:12px;color:#b0a080;">Cairo, Egypt · servix.world</span>
    </p>

  </td></tr>

  <!-- ARABIC NOTE -->
  <tr><td style="background:#1a1108;padding:24px 40px;" dir="rtl">
    <p style="margin:0 0 12px;font-size:15px;color:#e0d0b0;line-height:1.85;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
      عزيزتي ${first}، 👋
    </p>
    <p style="margin:0 0 12px;font-size:14px;color:#b0a080;line-height:2;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
      سيرفيكس أتطلق رسمياً — والعائلات في القاهرة بدأت تتصفح ملفات المساعدات. <strong style="color:#e8c97a;">ملفك الآن ظاهر ومتاح</strong> للعملاء في منطقتك.
    </p>
    <p style="margin:0 0 12px;font-size:14px;color:#b0a080;line-height:2;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
      لما عميل يقرر يستأجرك، هيبعتلك رسالة مباشرة على التطبيق — <strong style="color:#e8c97a;">متفوتيش الفرصة.</strong> حمّلي سيرفيكس دلوقتي وفعّلي الإشعارات.
    </p>
    <p style="margin:0;font-size:13px;color:#706050;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
      وتذكري — سيرفيكس بياخد 0% من راتبك. كل قرش تكسبيه ليكِ. 💚
    </p>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#0a0a0a;border-radius:0 0 14px 14px;padding:22px 40px;text-align:center;">
    <p style="margin:0 0 6px;font-size:13px;color:rgba(232,201,122,0.7);font-weight:700;">Servix — Domestic Staffing Platform</p>
    <p style="margin:0 0 10px;font-size:11px;color:#403020;line-height:1.6;">
      Cairo, Egypt · <a href="https://servix.world" style="color:#5d6b5a;text-decoration:none;">servix.world</a>
    </p>
    <p style="margin:0;font-size:10px;color:#2a2218;">
      You received this because your Servix helper profile was approved. Questions? Reply to this email.
    </p>
  </td></tr>

</table>
</td></tr></table>
</body>
</html>`;
}

// ── Sleep helper ─────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set in .env');
  if (!process.env.RESEND_API_KEY && !DRY_RUN) throw new Error('RESEND_API_KEY not set in .env');

  console.log(DRY_RUN ? '🔍  DRY RUN — no emails will be sent\n' : '📨  LIVE MODE — emails will be sent\n');

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅  Connected to MongoDB');

  // Load models
  const Maid = require('../src/models/Maid');
  const User = require('../src/models/User');

  // Fetch all approved maids with their user email
  const maids = await Maid.find({ approvalStatus: 'approved' })
    .populate('user', 'email name')
    .lean();

  const valid = maids.filter(m => m.user?.email);
  console.log(`📋  Found ${valid.length} approved maid(s) with email addresses\n`);

  if (valid.length === 0) {
    console.log('Nothing to send. Exiting.');
    process.exit(0);
  }

  const resend = DRY_RUN ? null : new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.EMAIL_FROM || 'Servix <noreply@servix.world>';
  const SUBJECT = '👀 Customers Are Looking at Your Profile — Download Servix Now';

  let sent = 0, failed = 0;

  for (const maid of valid) {
    const { email, name } = maid.user;
    const maidName = maid.fullName || name || 'there';

    if (DRY_RUN) {
      console.log(`  [DRY] Would send to: ${maidName} <${email}>`);
      sent++;
      continue;
    }

    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to: email,
        subject: SUBJECT,
        html: buildEmailHtml(maidName),
      });

      if (error) throw new Error(error.message);

      console.log(`  ✅  Sent → ${maidName} <${email}>`);
      sent++;
    } catch (err) {
      console.error(`  ❌  Failed → ${email}: ${err.message}`);
      failed++;
    }

    // Small pause between sends to avoid rate limiting
    await sleep(DELAY_MS);
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`✅  Sent:   ${sent}`);
  if (failed) console.log(`❌  Failed: ${failed}`);
  console.log(`─────────────────────────────────`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
