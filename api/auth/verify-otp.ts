import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { db } from '../_config/db';
import { generateRandomId } from '../_utils/crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-nexus-ai-platform-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { email, code, type } = req.body;

    if (!email || !code || !type) {
      return res.status(400).json({ error: 'Email, OTP code, and type are required.' });
    }

    // Retrieve active OTP
    const otps = await db.query(
      'SELECT * FROM otps WHERE email = ? AND code = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
      [email, code, type]
    );

    if (otps.length === 0) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    const otp = otps[0];
    const now = new Date();
    const expiry = new Date(otp.expires_at);

    if (expiry < now) {
      return res.status(400).json({ error: 'Verification code has expired.' });
    }

    if (type === 'VERIFY_EMAIL') {
      await db.execute('UPDATE users SET is_verified = 1 WHERE email = ?', [email]);
      await db.execute('DELETE FROM otps WHERE email = ? AND type = ?', [email, 'VERIFY_EMAIL']);

      const users = await db.query('SELECT id, name, email FROM users WHERE email = ?', [email]);
      const user = users[0];

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as any
      });

      const notificationId = generateRandomId();
      await db.execute(
        'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
        [
          notificationId,
          user.id,
          'Welcome to Nexus AI!',
          'Unlock extreme automated productivity with nodes, triggers, webhooks, and integrations.',
          'SUCCESS'
        ]
      );

      return res.status(200).json({
        message: 'Account verified successfully.',
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } else if (type === 'RESET_PASSWORD') {
      return res.status(200).json({
        message: 'OTP verified. Proceed to reset password.',
        email,
        code
      });
    }

    return res.status(400).json({ error: 'Invalid verification type.' });
  } catch (error) {
    console.error('[Auth Verify] Error:', error);
    return res.status(500).json({ error: 'Verification failed due to server error.' });
  }
}
