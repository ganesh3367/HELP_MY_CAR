const Order = require('../models/Order');
const Garage = require('../models/Garage');

// In-memory mock orders
let MOCK_ORDERS = [];

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public (should be Protected)
const createOrder = async (req, res) => {
    try {
        const { userId, garageId, vehicleDetails, userLocation } = req.body;

        if (!global.isConnected) {
            const mockOrder = {
                _id: 'mock_order_' + Date.now(),
                userId,
                garageId: { name: 'Quick Fix Motors', _id: garageId }, // Mock populated garage
                vehicleDetails,
                userLocation,
                mechanicLocation: {
                    lat: userLocation.lat - 0.01,
                    lng: userLocation.lng - 0.01
                },
                status: 'PENDING',
                createdAt: new Date()
            };
            MOCK_ORDERS.push(mockOrder);
            return res.status(201).json({ success: true, data: mockOrder });
        }

        const garage = await Garage.findById(garageId);
        if (!garage) {
            return res.status(404).json({ success: false, message: 'Garage not found' });
        }

        // Initialize mechanic location at garage location
        // In a real app, this would be the actual mechanic's location
        // The garage location is stored as [lng, lat] in MongoDB
        const mechanicLocation = {
            lng: garage.location.coordinates[0],
            lat: garage.location.coordinates[1]
        };

        const order = await Order.create({
            userId,
            garageId,
            vehicleDetails,
            userLocation,
            mechanicLocation,
            status: 'PENDING'
        });

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get order status & mechanic location
// @route   GET /api/orders/:id/track
// @access  Public
const trackOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!global.isConnected) {
            let order = MOCK_ORDERS.find(o => o._id === id);
            // If not found in memory (maybe server restart), create on fly for demo
            if (!order) {
                order = {
                    _id: id,
                    garageId: { name: 'Quick Fix Motors' },
                    userLocation: { lat: 37.78825, lng: -122.4324 },
                    mechanicLocation: { lat: 37.77825, lng: -122.4224 },
                    status: 'PENDING',
                    vehicleDetails: { make: 'Tesla', model: 'Model Y' }
                };
                MOCK_ORDERS.push(order);
            }

            // Move mechanic
            if (order.status !== 'COMPLETED') {
                const latDiff = order.userLocation.lat - order.mechanicLocation.lat;
                const lngDiff = order.userLocation.lng - order.mechanicLocation.lng;
                order.mechanicLocation.lat += latDiff * 0.1;
                order.mechanicLocation.lng += lngDiff * 0.1;

                if (Math.abs(latDiff) < 0.0005 && Math.abs(lngDiff) < 0.0005) {
                    order.status = 'ARRIVED';
                } else if (order.status === 'PENDING') {
                    order.status = 'ON_THE_WAY';
                }
            }

            return res.status(200).json({ success: true, data: order });
        }

        const order = await Order.findById(id).populate('garageId', 'name phone');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Simulating mechanic movement for demo purposes
        // Move mechanic slightly towards user with every request
        // NOTE: This is purely for demonstration to show movement on frontend
        if (order.status !== 'COMPLETED' && order.status !== 'CANCELLED') {
            const latDiff = order.userLocation.lat - order.mechanicLocation.lat;
            const lngDiff = order.userLocation.lng - order.mechanicLocation.lng;

            // Move 10% of the way
            order.mechanicLocation.lat += latDiff * 0.1;
            order.mechanicLocation.lng += lngDiff * 0.1;

            // If very close, mark as arrived
            if (Math.abs(latDiff) < 0.001 && Math.abs(lngDiff) < 0.001 && order.status !== 'ARRIVED') {
                order.status = 'ARRIVED';
            } else if (order.status === 'PENDING') {
                order.status = 'ON_THE_WAY';
            }

            await order.save();
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    createOrder,
    trackOrder
};
