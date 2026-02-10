const mongoose = require('mongoose');

const garageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
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
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    phone: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    estimatedCost: {
        type: String,
        default: '$'
    },
    specialties: [{
        type: String
    }],
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create index for geospatial queries
garageSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Garage', garageSchema);
