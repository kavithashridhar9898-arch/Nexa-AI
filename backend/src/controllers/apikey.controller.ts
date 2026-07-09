import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../config/db';
import { generateRandomId } from '../utils/crypto';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const createApiKey = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const { name, scopes } = req.body;
    if (!name) return res.status(400).json({ error: 'Key name is required.' });

    // Generate token
    const tokenBytes = crypto.randomBytes(24).toString('hex');
    const apiKey = `nx_live_${tokenBytes}`;
    
    // Prefix and Hash
    const prefix = 'nx_live_';
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const keyId = generateRandomId();
    const finalScopes = scopes || 'read,write';

    await db.execute(
      'INSERT INTO api_keys (id, user_id, name, key_prefix, key_hash, scopes) VALUES (?, ?, ?, ?, ?, ?)',
      [keyId, userId, name, prefix, keyHash, finalScopes]
    );

    // Notify user
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

    // Return the actual raw key to the user only once
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
};

export const getApiKeys = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const keys = await db.query(
      'SELECT id, name, key_prefix, scopes, created_at, last_used_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return res.status(200).json({ keys });
  } catch (error) {
    console.error('[Get API Keys] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch API keys.' });
  }
};

export const revokeApiKey = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const existing = await db.query('SELECT name FROM api_keys WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'API key not found.' });
    }

    const keyName = existing[0].name;

    await db.execute('DELETE FROM api_keys WHERE id = ? AND user_id = ?', [id, userId]);

    // Create a warning notification
    const notificationId = generateRandomId();
    await db.execute(
      'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
      [
        notificationId,
        userId,
        'API Key Revoked',
        `API key "${keyName}" was revoked and can no longer be used for authentication.`,
        'WARNING'
      ]
    );

    return res.status(200).json({ message: 'API key revoked successfully.' });
  } catch (error) {
    console.error('[Revoke API Key] Error:', error);
    return res.status(500).json({ error: 'Failed to revoke API key.' });
  }
};
