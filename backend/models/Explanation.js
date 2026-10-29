const mongoose = require('mongoose');

const ExplanationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending Review', 'Pending Submission', 'Submitted', 'Reviewed', 'Acknowledged', 'Excused', 'Warning Issued'],
        default: 'Pending Review'
    },
    token: {
        type: String
    },
    adminNotes: {
        type: String,
        default: ''
    },
    reviewedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Explanation', ExplanationSchema);
