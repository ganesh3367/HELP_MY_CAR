const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    garageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Garage',
        required: true
    },
    garageName: String,
    vehicleDetails: {
        make: String,
        model: String,
        year: String,
        issue: String
    },
    userLocation: {
        lat: Number,
        lng: Number,
        address: String
    },
    mechanicLocation: {
        lat: Number,
        lng: Number
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    etaMinutes: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);
