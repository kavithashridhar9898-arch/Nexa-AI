import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-nexus-ai-platform-2026';

export interface AuthenticatedRequest extends VercelRequest {
  user?: {
    userId: string;
    email: string;
  };
}

export type AuthenticatedHandler = (req: AuthenticatedRequest, res: VercelResponse) => Promise<any> | any;

export const withAuth = (handler: AuthenticatedHandler) => {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
      }

      const token = authHeader.split(' ')[1];

      // Check if token is an API key
      if (token.startsWith('nx_live_')) {
        const keyHash = crypto.createHash('sha256').update(token).digest('hex');

        // Query database
        const keys = await db.query('SELECT * FROM api_keys WHERE key_hash = ?', [keyHash]);
        if (keys.length === 0) {
          return res.status(401).json({ error: 'Invalid API key.' });
        }

        const key = keys[0];

        // Update last_used_at
        const formattedNow = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await db.execute('UPDATE api_keys SET last_used_at = ? WHERE id = ?', [formattedNow, key.id]);

        // Fetch user email
        const users = await db.query('SELECT email FROM users WHERE id = ?', [key.user_id]);
        if (users.length === 0) {
          return res.status(401).json({ error: 'User associated with this key not found.' });
        }

        const authReq = req as AuthenticatedRequest;
        authReq.user = {
          userId: key.user_id,
          email: users[0].email
        };

        return await handler(authReq, res);
      }

      // Treat as JWT token
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
        const authReq = req as AuthenticatedRequest;
        authReq.user = {
          userId: decoded.userId,
          email: decoded.email
        };
        return await handler(authReq, res);
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired authentication token.' });
      }
    } catch (error) {
      console.error('[Auth Middleware] Error:', error);
      return res.status(500).json({ error: 'Authentication failed due to server error.' });
    }
  };
};
