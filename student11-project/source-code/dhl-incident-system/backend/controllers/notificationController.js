import Notification from '../models/Notification.js';

// @desc    Get all notifications
// @route   GET /api/notifications
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
};

// @desc    Create a new notification
// @route   POST /api/notifications
export const createNotification = async (req, res) => {
    try {
        const notification = await Notification.create(req.body);
        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create notification', error: error.message });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        res.status(200).json(notification);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update notification', error: error.message });
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ read: false }, { read: true });
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(400).json({ message: 'Failed to update notifications', error: error.message });
    }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
export const clearAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({});
        res.status(200).json({ message: 'All notifications cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to clear notifications', error: error.message });
    }
};