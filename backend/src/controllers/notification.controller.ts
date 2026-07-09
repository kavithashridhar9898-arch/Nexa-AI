import { Request, Response } from 'express';
import { db } from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

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
};

export const markNotificationRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    await db.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    return res.status(200).json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('[Mark Notification Read] Error:', error);
    return res.status(500).json({ error: 'Failed to update notification.' });
  }
};

export const markAllNotificationsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    await db.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);

    return res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('[Mark All Read] Error:', error);
    return res.status(500).json({ error: 'Failed to update notifications.' });
  }
};

export const deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    await db.execute('DELETE FROM notifications WHERE id = ? AND user_id = ?', [id, userId]);

    return res.status(200).json({ message: 'Notification deleted.' });
  } catch (error) {
    console.error('[Delete Notification] Error:', error);
    return res.status(500).json({ error: 'Failed to delete notification.' });
  }
};
