import nodemailer from 'nodemailer';

const smtpUser = process.env.EMAIL_USER;
const smtpPass = process.env.EMAIL_PASS;
const smtpFrom = process.env.EMAIL_FROM || 'noreply@nexus-ai.com';

let transporter: nodemailer.Transporter | null = null;

if (smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525'),
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
}

export const sendOtpEmail = async (to: string, code: string, type: 'VERIFY_EMAIL' | 'RESET_PASSWORD'): Promise<boolean> => {
  const subject = type === 'VERIFY_EMAIL' 
    ? 'Verify Your Nexus AI Account' 
    : 'Reset Your Nexus AI Password';
    
  const bodyText = type === 'VERIFY_EMAIL'
    ? `Welcome to Nexus AI! Your email verification code is: ${code}. This code is valid for 15 minutes.`
    : `You requested to reset your Nexus AI password. Your verification OTP code is: ${code}. This code is valid for 15 minutes. If you did not request this, please ignore this email.`;

  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
      <h2 style="color: #09090b; text-align: center; font-size: 24px; margin-bottom: 24px;">Nexus AI</h2>
      <p style="font-size: 16px; color: #3f3f46; line-height: 1.5;">Hello,</p>
      <p style="font-size: 16px; color: #3f3f46; line-height: 1.5;">${type === 'VERIFY_EMAIL' ? 'Thank you for registering with Nexus AI. Please use the verification code below to activate your account:' : 'A request was made to reset your password. Use the following code to complete your reset process:'}</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #7c3aed; background: #f5f3ff; padding: 12px 24px; border-radius: 6px; border: 1px solid #c084fc;">${code}</span>
      </div>
      <p style="font-size: 14px; color: #71717a; text-align: center; margin-top: 24px;">This code will expire in 15 minutes.</p>
      <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
      <p style="font-size: 12px; color: #a1a1aa; text-align: center;">This is an automated email, please do not reply. Nexus AI, Inc.</p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: smtpFrom,
        to,
        subject,
        text: bodyText,
        html: bodyHtml
      });
      console.log(`[Email] OTP sent to ${to} successfully via SMTP.`);
      return true;
    } catch (err) {
      console.error('[Email] Failed to send email via SMTP, falling back to console log.', err);
    }
  }

  // Console fallback if SMTP is not configured or fails
  console.log(`
============================================================
[EMAIL MOCK/FALLBACK]
To: ${to}
Subject: ${subject}
Message: ${bodyText}
OTP Code: ${code}
============================================================
  `);
  return true;
};
