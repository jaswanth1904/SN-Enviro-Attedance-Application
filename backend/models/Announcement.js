const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title for the announcement']
    },
    message: {
        type: String,
        required: [true, 'Please add a message content']
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    priority: {
        type: String,
        enum: ['Normal', 'Important', 'Urgent'],
        default: 'Normal'
    },
    audience: {
        type: String,
        enum: ['All Employees', 'Department', 'Site', 'Selected Employees'],
        default: 'All Employees'
    },
    targetDepartments: [{
        type: String // We can store department names or ObjectId
    }],
    targetSites: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Site'
    }],
    targetUsers: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    isPublished: {
        type: Boolean,
        default: true
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    expiryDate: {
        type: Date
    },
    readBy: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Announcement', announcementSchema);
