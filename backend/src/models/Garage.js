const mongoose = require('mongoose');

const GarageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true // [longitude, latitude]
        }
    },
    phone: String,
    rating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    estimatedCost: String,
    specialties: [String],
    experience: String,
    ownerEmail: String,
    isAvailable: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Geospatial index for nearby search
GarageSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Garage', GarageSchema);
