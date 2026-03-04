const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a site name'],
        unique: true
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
        },
        address: String
    },
    radius: {
        type: Number,
        default: 100 // in meters
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create 2dsphere index for geospatial queries
siteSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Site', siteSchema);
