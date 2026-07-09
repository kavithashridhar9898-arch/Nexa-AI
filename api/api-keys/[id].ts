import { VercelResponse } from '@vercel/node';
import { db } from '../config/db';
import { withAuth, AuthenticatedRequest } from '../config/auth';
import { generateRandomId } from '../utils/crypto';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const userId = req.user?.userId;
  const { id } = req.query;

  if (!userId) return res.status(401).json({ error: 'Unauthorized.' });
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid key ID.' });
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const existing = await db.query('SELECT name FROM api_keys WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'API key not found.' });
    }

    const keyName = existing[0].name;

    await db.execute('DELETE FROM api_keys WHERE id = ? AND user_id = ?', [id, userId]);

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
}

export default withAuth(handler);
