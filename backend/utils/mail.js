const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendResetPasswordEmail = async (to, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"Movo" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset della password - Movo',
    html: `
      <div style="background:#0F1115;padding:40px 20px;font-family:'Inter',sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#1A1D24;border-radius:18px;padding:36px;border:1px solid rgba(255,255,255,0.06);">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="font-size:40px;">🎵</span>
            <h1 style="color:#fff;font-size:24px;font-weight:800;margin:8px 0 0;">Movo</h1>
          </div>
          <h2 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 8px;text-align:center;">Reset della Password</h2>
          <p style="color:#B8BCC8;font-size:14px;line-height:1.6;text-align:center;margin:0 0 28px;">
            Hai richiesto il reset della password. Clicca il pulsante qui sotto per impostarne una nuova.
          </p>
          <div style="text-align:center;">
            <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#D4AF37,#F0D060);color:#0F1115;font-size:15px;font-weight:700;text-decoration:none;border-radius:14px;letter-spacing:0.3px;">
              Reimposta Password
            </a>
          </div>
          <p style="color:#6B7280;font-size:12px;text-align:center;margin:24px 0 0;line-height:1.5;">
            Se non hai richiesto il reset, ignora questa email.<br>
            Il link è valido per 30 minuti.
          </p>
          <p style="color:#4B5563;font-size:11px;text-align:center;margin:16px 0 0;">
            Se il pulsante non funziona, copia questo link nel browser:<br>
            <span style="color:#D4AF37;">${resetUrl}</span>
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendOtpEmail = async (to, code) => {
  const mailOptions = {
    from: `"Movo" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Il tuo codice di verifica - Movo',
    html: `
      <div style="background:#0F1115;padding:40px 20px;font-family:'Inter',sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#1A1D24;border-radius:18px;padding:36px;border:1px solid rgba(255,255,255,0.06);text-align:center;">
          <div style="margin-bottom:24px;">
            <span style="font-size:40px;">🎵</span>
            <h1 style="color:#fff;font-size:24px;font-weight:800;margin:8px 0 0;">Movo</h1>
          </div>
          <h2 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 8px;">Codice di Verifica</h2>
          <p style="color:#B8BCC8;font-size:14px;line-height:1.6;margin:0 0 28px;">
            Usa questo codice per pubblicare passaggi e annunci sulla piattaforma.
          </p>
          <div style="background:#0F1115;border-radius:14px;padding:20px;margin-bottom:28px;border:1px solid rgba(212,175,55,0.2);">
            <span style="font-size:42px;font-weight:800;letter-spacing:8px;color:#D4AF37;">${code}</span>
          </div>
          <p style="color:#6B7280;font-size:12px;text-align:center;margin:0;line-height:1.5;">
            Il codice è valido per 5 minuti.<br>
            Se non hai richiesto questo codice, ignora questa email.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetPasswordEmail, sendOtpEmail };
