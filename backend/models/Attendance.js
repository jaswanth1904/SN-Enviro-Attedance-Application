const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    site: {
        type: mongoose.Schema.ObjectId,
        ref: 'Site',
        required: false // Optional for field/service locations
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    locationName: {
        type: String,
        default: 'Unknown' // For service locations like "Gujarat"
    },
    selfieUrl: {
        type: String,
        required: false // Optional for imports and office employees
    },
    distanceFromSite: {
        type: Number,
        required: false // Optional if not matched to a site
    },
    status: {
        type: String,
        enum: ['Present', 'Late', 'Absent', 'Half Day'],
        default: 'Present'
    },
    timestamp: {
        type: Date,
        default: Date.now // This serves as checkIn time
    },
    checkOut: {
        type: Date
    },
    totalHours: {
        type: Number,
        default: 0
    },
    overtime: {
        type: Number,
        default: 0
    }
});

// Index for geo queries and reporting
attendanceSchema.index({ timestamp: -1, user: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
