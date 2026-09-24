import { Router } from 'express';
import * as notification from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', notification.getNotifications);
router.patch('/:id/read', notification.markNotificationRead);
router.patch('/read-all', notification.markAllNotificationsRead);
export default router;
