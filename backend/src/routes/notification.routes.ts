import { Router } from 'express';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/mark-all-read', markAllNotificationsRead);
router.put('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);

export default router;
