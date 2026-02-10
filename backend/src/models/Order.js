const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: String, // In a real app, this would be ObjectId ref to User
        required: true
    },
    garageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Garage',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    vehicleDetails: {
        make: String,
        model: String,
        year: String,
        issue: String
    },
    userLocation: {
        lat: Number,
        lng: Number
    },
    mechanicLocation: {
        lat: Number,
        lng: Number
    },
    totalAmount: {
        type: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
