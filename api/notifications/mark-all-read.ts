import { VercelResponse } from '@vercel/node';
import { db } from '../config/db';
import { withAuth, AuthenticatedRequest } from '../config/auth';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    await db.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    return res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('[Mark All Read] Error:', error);
    return res.status(500).json({ error: 'Failed to update notifications.' });
  }
}

export default withAuth(handler);
