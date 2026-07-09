import { VercelResponse } from '@vercel/node';
import { db } from '../_config/db';
import { withAuth, AuthenticatedRequest } from '../_config/auth';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const notifications = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    const parsedNotifications = notifications.map((n: any) => ({
      ...n,
      is_read: n.is_read === 1 || n.is_read === true || n.is_read === '1'
    }));

    return res.status(200).json({ notifications: parsedNotifications });
  } catch (error) {
    console.error('[Get Notifications] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
}

export default withAuth(handler);
