import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_config/db';
import { hashPassword, generateRandomId } from '../_utils/crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({ error: 'Email, OTP code, and new password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Validate OTP
    const otps = await db.query(
      'SELECT * FROM otps WHERE email = ? AND code = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
      [email, code, 'RESET_PASSWORD']
    );

    if (otps.length === 0) {
      return res.status(400).json({ error: 'Invalid reset code.' });
    }

    const otp = otps[0];
    const now = new Date();
    const expiry = new Date(otp.expires_at);

    if (expiry < now) {
      return res.status(400).json({ error: 'Reset code has expired.' });
    }

    // Hash and update
    const hashedPassword = await hashPassword(password);
    await db.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);
    
    // Clear OTPs
    await db.execute('DELETE FROM otps WHERE email = ? AND type = ?', [email, 'RESET_PASSWORD']);

    // Send a success notification if user exists
    const users = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      const notificationId = generateRandomId();
      await db.execute(
        'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
        [
          notificationId,
          users[0].id,
          'Password Changed',
          'Your account password was updated successfully. If you did not do this, contact support immediately.',
          'WARNING'
        ]
      );
    }

    return res.status(200).json({
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    console.error('[Auth Reset Password] Error:', error);
    return res.status(500).json({ error: 'Password reset failed due to server error.' });
  }
}
