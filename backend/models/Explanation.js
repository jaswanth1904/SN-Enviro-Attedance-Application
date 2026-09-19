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
        enum: ['Pending Review', 'Reviewed'],
        default: 'Pending Review'
    },
    token: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Explanation', ExplanationSchema);
