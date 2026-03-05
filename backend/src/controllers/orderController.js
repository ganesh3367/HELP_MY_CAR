const { db } = require('../config/firebase');

// In-memory mock orders (fallback)
let MOCK_ORDERS = [];

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
    try {
        const { userId, garageId, vehicleDetails, userLocation } = req.body;
        // Basic validation of required fields
        if (!userId || !garageId || !vehicleDetails || !userLocation) {
            return res.status(400).json({ success: false, message: 'Missing required order fields.' });
        }

        if (!db) {
            const mockOrder = {
                id: 'mock_order_' + Date.now(),
                userId,
                garageId: { name: 'Quick Fix Motors', id: garageId },
                vehicleDetails,
                userLocation,
                mechanicLocation: {
                    lat: userLocation.lat - 0.01,
                    lng: userLocation.lng - 0.01
                },
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };
            MOCK_ORDERS.push(mockOrder);
            return res.status(201).json({ success: true, data: mockOrder });
        }

        // Get garage details from Firestore
        const garageDoc = await db.collection('garages').doc(garageId).get();
        if (!garageDoc.exists) {
            return res.status(404).json({ success: false, message: 'Garage not found' });
        }
        const garage = garageDoc.data();

        // Initialize mechanic location
        const mechanicLocation = {
            lat: garage.location.lat,
            lng: garage.location.lng
        };

        const orderData = {
            userId,
            garageId,
            garageName: garage.name, // Denormalize for easier access
            vehicleDetails,
            userLocation,
            mechanicLocation,
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };

        const orderRef = await db.collection('orders').add(orderData);

        res.status(201).json({
            success: true,
            data: { id: orderRef.id, ...orderData }
        });
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get order status & mechanic location
// @route   GET /api/orders/:id/track
// @access  Public
const trackOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Helper for distance and ETA calculation (Haversine simplified)
        const calculateETA = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Radius of earth in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c; // Distance in km

            // Assume 2 minutes per km + 3 minutes base prep time
            const etaMinutes = Math.max(1, Math.round(distance * 2 + 3));
            return { distance, etaMinutes };
        };

        if (!db) {
            let order = MOCK_ORDERS.find(o => o.id === id);
            if (!order) {
                order = {
                    id: id,
                    garageId: { name: 'Quick Fix Motors' },
                    userLocation: { lat: 37.78825, lng: -122.4324 },
                    mechanicLocation: { lat: 37.77825, lng: -122.4224 },
                    status: 'PENDING',
                    vehicleDetails: { make: 'Tesla', model: 'Model Y' }
                };
                MOCK_ORDERS.push(order);
            }

            // Simple movement simulation
            if (order.status !== 'COMPLETED' && order.status !== 'ARRIVED') {
                const latDiff = order.userLocation.lat - order.mechanicLocation.lat;
                const lngDiff = order.userLocation.lng - order.mechanicLocation.lng;
                order.mechanicLocation.lat += latDiff * 0.1;
                order.mechanicLocation.lng += lngDiff * 0.1;

                if (Math.abs(latDiff) < 0.0005 && Math.abs(lngDiff) < 0.0005) {
                    order.status = 'ARRIVED';
                } else {
                    order.status = 'ON_THE_WAY';
                }
            }

            const { etaMinutes } = calculateETA(
                order.mechanicLocation.lat,
                order.mechanicLocation.lng,
                order.userLocation.lat,
                order.userLocation.lng
            );
            order.etaMinutes = order.status === 'ARRIVED' ? 0 : etaMinutes;

            return res.status(200).json({ success: true, data: order });
        }

        const orderRef = db.collection('orders').doc(id);
        const doc = await orderRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        let order = { id: doc.id, ...doc.data() };

        // Simulating mechanic movement for demo purposes
        if (order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && order.status !== 'ARRIVED') {
            const latDiff = order.userLocation.lat - order.mechanicLocation.lat;
            const lngDiff = order.userLocation.lng - order.mechanicLocation.lng;

            order.mechanicLocation.lat += latDiff * 0.1;
            order.mechanicLocation.lng += lngDiff * 0.1;

            if (Math.abs(latDiff) < 0.001 && Math.abs(lngDiff) < 0.001) {
                order.status = 'ARRIVED';
            } else if (order.status === 'PENDING') {
                order.status = 'ON_THE_WAY';
            }

            const { etaMinutes } = calculateETA(
                order.mechanicLocation.lat,
                order.mechanicLocation.lng,
                order.userLocation.lat,
                order.userLocation.lng
            );
            order.etaMinutes = order.status === 'ARRIVED' ? 0 : etaMinutes;

            await orderRef.update({
                mechanicLocation: order.mechanicLocation,
                status: order.status,
                etaMinutes: order.etaMinutes
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Track Order Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all orders for a specific garage
// @route   GET /api/orders/garage/:garageId
// @access  Public (Should be Private in Prod)
const getGarageOrders = async (req, res) => {
    try {
        const { garageId } = req.params;

        if (!db) {
            const garageOrders = MOCK_ORDERS.filter(o => o.garageId === garageId || o.garageId?.id === garageId);
            return res.status(200).json({ success: true, count: garageOrders.length, data: garageOrders });
        }

        const snapshot = await db.collection('orders')
            .where('garageId', '==', garageId)
            .orderBy('createdAt', 'desc')
            .get();

        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Get Garage Orders Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Public (Should be Private in Prod)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStats = ['PENDING', 'ACCEPTED', 'REJECTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
        if (!allowedStats.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        if (!db) {
            const orderIndex = MOCK_ORDERS.findIndex(o => o.id === id);
            if (orderIndex === -1) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }
            MOCK_ORDERS[orderIndex].status = status;
            return res.status(200).json({ success: true, data: MOCK_ORDERS[orderIndex] });
        }

        const orderRef = db.collection('orders').doc(id);
        const doc = await orderRef.get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        await orderRef.update({ status, updatedAt: new Date().toISOString() });

        res.status(200).json({
            success: true,
            data: { id, ...doc.data(), status }
        });
    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createOrder,
    trackOrder,
    getGarageOrders,
    updateOrderStatus
};
