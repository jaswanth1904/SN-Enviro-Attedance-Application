const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['MD Announcement', 'Late Login', 'Absent Employee', 'Leave Approval', 'Leave Rejection', 'Attendance Reminder', 'Important Alert', 'System'],
        default: 'System'
    },
    priority: {
        type: String,
        enum: ['Normal', 'Important', 'Urgent'],
        default: 'Normal'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    relatedLink: {
        type: String // To navigate to a specific page when clicked
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// TTL Index for auto-deleting records older than 90 days (7776000 seconds)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Notification', notificationSchema);
