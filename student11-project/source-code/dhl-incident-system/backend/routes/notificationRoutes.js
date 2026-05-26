import express from 'express';
import {
    getNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications
} from '../controllers/notificationController.js';

const router = express.Router();

router.route('/')
    .get(getNotifications)
    .post(createNotification)
    .delete(clearAllNotifications);

router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

export default router;