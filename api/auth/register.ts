import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { db } from '../_config/db';
import { hashPassword, generateRandomId } from '../_utils/crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-nexus-ai-platform-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const userId = generateRandomId();
    const hashedPassword = await hashPassword(password);

    // Save user as verified directly (removed OTP step in register)
    await db.execute(
      'INSERT INTO users (id, name, email, password_hash, is_verified) VALUES (?, ?, ?, ?, 1)',
      [userId, name, email, hashedPassword]
    );

    // Sign JWT
    const token = jwt.sign({ userId, email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any
    });

    // Add Welcome Notification
    const notificationId = generateRandomId();
    await db.execute(
      'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
      [
        notificationId,
        userId,
        'Welcome to Nexus AI!',
        'Unlock extreme automated productivity with nodes, triggers, webhooks, and integrations.',
        'SUCCESS'
      ]
    );

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: { id: userId, name, email }
    });
  } catch (error) {
    console.error('[Auth Register] Error:', error);
    return res.status(500).json({ error: 'Registration failed due to server error.' });
  }
}
