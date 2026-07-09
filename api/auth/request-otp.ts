import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_config/db';
import { generateOtp, generateRandomId } from '../_utils/crypto';
import { sendOtpEmail } from '../_services/mail.service';

const getFormattedDate = (futureMs: number = 0) => {
  return new Date(Date.now() + futureMs).toISOString().slice(0, 19).replace('T', ' ');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({ error: 'Email and verification type are required.' });
    }

    if (type === 'RESET_PASSWORD') {
      const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
      }
    }

    await db.execute('DELETE FROM otps WHERE email = ? AND type = ?', [email, type]);

    const otpCode = generateOtp();
    const otpId = generateRandomId();
    const expiresAt = getFormattedDate(15 * 60 * 1000);

    await db.execute(
      'INSERT INTO otps (id, email, code, type, expires_at) VALUES (?, ?, ?, ?, ?)',
      [otpId, email, otpCode, type, expiresAt]
    );

    await sendOtpEmail(email, otpCode, type);

    return res.status(200).json({
      message: 'Verification code sent.',
      email
    });
  } catch (error) {
    console.error('[Auth Request OTP] Error:', error);
    return res.status(500).json({ error: 'Failed to request OTP.' });
  }
}
