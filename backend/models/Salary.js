const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: String,
        required: true // Format: "January 2024"
    },
    baseSalary: {
        type: Number,
        required: true
    },
    overtimePay: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    netSalary: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Credited'],
        default: 'Pending'
    },
    creditedAt: {
        type: Date
    },
    transactionId: String,
    remarks: String
});

module.exports = mongoose.model('Salary', salarySchema);
