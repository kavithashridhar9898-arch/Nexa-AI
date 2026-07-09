import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { comparePassword } from '../utils/crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-nexus-ai-platform-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Fetch user
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    // Compare passwords
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Sign JWT
    const expiresIn = rememberMe ? '30d' : JWT_EXPIRES_IN;
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: expiresIn as any
    });

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('[Auth Login] Error:', error);
    return res.status(500).json({ error: 'Login failed due to server error.' });
  }
}
