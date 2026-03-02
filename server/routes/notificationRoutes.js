import express from 'express';
const router = express.Router();
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/auth.js';

router.use(authMiddleware); // All routes require authentication

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
