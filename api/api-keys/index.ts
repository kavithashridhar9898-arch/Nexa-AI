import { VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { db } from '../config/db';
import { withAuth, AuthenticatedRequest } from '../config/auth';
import { generateRandomId } from '../utils/crypto';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

  // GET: Fetch API Keys listing
  if (req.method === 'GET') {
    try {
      const keys = await db.query(
        'SELECT id, name, key_prefix, scopes, created_at, last_used_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return res.status(200).json({ keys });
    } catch (error) {
      console.error('[Get API Keys] Error:', error);
      return res.status(500).json({ error: 'Failed to fetch API keys.' });
    }
  }

  // POST: Generate a new API Key
  if (req.method === 'POST') {
    try {
      const { name, scopes } = req.body;
      if (!name) return res.status(400).json({ error: 'Key name is required.' });

      const tokenBytes = crypto.randomBytes(24).toString('hex');
      const apiKey = `nx_live_${tokenBytes}`;
      
      const prefix = 'nx_live_';
      const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

      const keyId = generateRandomId();
      const finalScopes = scopes || 'read,write';

      await db.execute(
        'INSERT INTO api_keys (id, user_id, name, key_prefix, key_hash, scopes) VALUES (?, ?, ?, ?, ?, ?)',
        [keyId, userId, name, prefix, keyHash, finalScopes]
      );

      const notificationId = generateRandomId();
      await db.execute(
        'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
        [
          notificationId,
          userId,
          'API Key Generated',
          `API key "${name}" was created. Make sure to copy it now; you won't be able to see it again.`,
          'WARNING'
        ]
      );

      return res.status(201).json({
        message: 'API Key generated successfully. Please copy this key and store it securely.',
        apiKey,
        key: {
          id: keyId,
          name,
          key_prefix: prefix,
          scopes: finalScopes,
          created_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[Create API Key] Error:', error);
      return res.status(500).json({ error: 'Failed to create API key.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}

export default withAuth(handler);
