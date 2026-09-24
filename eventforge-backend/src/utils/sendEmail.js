const nodemailer = require('nodemailer');

// If SMTP credentials aren't configured, this quietly logs instead of throwing —
// so the rest of the app (bookings, invites, etc.) keeps working in local/dev setups.
const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[email skipped — SMTP not configured] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: text || '',
    html: html || `<p>${text || ''}</p>`,
  });
};

module.exports = sendEmail;
