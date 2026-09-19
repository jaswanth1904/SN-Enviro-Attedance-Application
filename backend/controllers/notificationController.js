const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50); // Get latest 50

        const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

        res.status(200).json({ success: true, data: notifications, unreadCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create notification (Internal utility, not exposed to standard users directly)
exports.createNotification = async (userId, title, message, type = 'System', priority = 'Normal', link = null) => {
    try {
        const notif = await Notification.create({
            user: userId,
            title,
            message,
            type,
            priority,
            relatedLink: link
        });
        return notif;
    } catch (err) {
        console.error('Error creating notification:', err);
    }
};
