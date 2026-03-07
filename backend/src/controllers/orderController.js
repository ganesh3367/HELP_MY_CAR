const { db } = require('../config/firebase');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
    try {
        const { userId, garageId, vehicleDetails, userLocation } = req.body;

        if (!userId || !garageId || !vehicleDetails || !userLocation) {
            return res.status(400).json({ success: false, message: 'Missing required order fields.' });
        }

        let garageName = 'Unknown Garage';
        let mechanicLocation = { lat: 18.5204, lng: 73.8567 }; // Default

        if (db) {
            const garageDoc = await db.collection('garages').doc(garageId).get();
            if (garageDoc.exists) {
                const garage = garageDoc.data();
                garageName = garage.name;
                mechanicLocation = garage.location;
            }
        } else {
            console.log('Firebase not initialized. Using MOCK GARAGE for order.');
            garageName = 'Mock Garage';
        }

        const newOrder = {
            userId,
            garageId,
            garageName,
            vehicleDetails,
            userLocation,
            mechanicLocation,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        let orderId = 'mock-order-' + Date.now();

        if (db) {
            const orderRef = await db.collection('orders').add(newOrder);
            orderId = orderRef.id;
        }

        const orderData = { id: orderId, ...newOrder };

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.emit('new_order', orderData);
        }

        res.status(201).json({
            success: true,
            data: orderData
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

        if (!db || id.startsWith('mock-')) {
            return res.status(200).json({
                success: true,
                data: {
                    id,
                    status: 'PENDING',
                    mechanicLocation: { lat: 18.5204, lng: 73.8567 }
                }
            });
        }

        const doc = await db.collection('orders').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({
            success: true,
            data: { id: doc.id, ...doc.data() }
        });
    } catch (error) {
        console.error('Track Order Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all orders for a specific garage
// @route   GET /api/orders/garage/:garageId
// @access  Public
const getGarageOrders = async (req, res) => {
    try {
        const { garageId } = req.params;

        if (!db) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: []
            });
        }

        const snapshot = await db.collection('orders').where('garageId', '==', garageId).orderBy('createdAt', 'desc').get();
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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
// @access  Public
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, mechanicLocation } = req.body;

        const allowedStats = ['PENDING', 'ACCEPTED', 'REJECTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
        if (status && !allowedStats.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const updateData = { updatedAt: new Date().toISOString() };
        if (status) updateData.status = status;
        if (mechanicLocation) updateData.mechanicLocation = mechanicLocation;

        if (!db || id.startsWith('mock-')) {
            return res.status(200).json({
                success: true,
                data: { id, ...updateData }
            });
        }

        const orderRef = db.collection('orders').doc(id);
        await orderRef.update(updateData);

        const updatedDoc = await orderRef.get();
        const order = { id: updatedDoc.id, ...updatedDoc.data() };

        // Emit Socket.io update
        const io = req.app.get('io');
        if (id) {
            io.to(id).emit('order_updated', order);
            if (mechanicLocation) {
                io.to(id).emit('location_updated', mechanicLocation);
            }
        }

        res.status(200).json({
            success: true,
            data: order
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
