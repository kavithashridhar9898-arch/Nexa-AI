import { VercelResponse } from '@vercel/node';
import { db } from '../_config/db';
import { withAuth, AuthenticatedRequest } from '../_config/auth';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const userId = req.user?.userId;
  const { id } = req.query;

  if (!userId) return res.status(401).json({ error: 'Unauthorized.' });
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid notification ID.' });
  }

  // PUT: Mark notification as read
  if (req.method === 'PUT') {
    try {
      await db.execute(
        'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
      console.error('[Mark Read] Error:', error);
      return res.status(500).json({ error: 'Failed to update notification.' });
    }
  }

  // DELETE: Delete notification
  if (req.method === 'DELETE') {
    try {
      await db.execute('DELETE FROM notifications WHERE id = ? AND user_id = ?', [id, userId]);
      return res.status(200).json({ message: 'Notification deleted.' });
    } catch (error) {
      console.error('[Delete Notification] Error:', error);
      return res.status(500).json({ error: 'Failed to delete notification.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}

export default withAuth(handler);
