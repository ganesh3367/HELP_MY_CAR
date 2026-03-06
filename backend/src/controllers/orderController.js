const Order = require('../models/Order');
const Garage = require('../models/Garage');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
    try {
        const { userId, garageId, vehicleDetails, userLocation } = req.body;

        if (!userId || !garageId || !vehicleDetails || !userLocation) {
            return res.status(400).json({ success: false, message: 'Missing required order fields.' });
        }

        const garage = await Garage.findById(garageId);
        if (!garage) {
            return res.status(404).json({ success: false, message: 'Garage not found' });
        }

        // Initialize mechanic location from garage location
        const mechanicLocation = {
            lat: garage.location.coordinates[1],
            lng: garage.location.coordinates[0]
        };

        const order = new Order({
            userId,
            garageId,
            garageName: garage.name,
            vehicleDetails,
            userLocation,
            mechanicLocation,
            status: 'PENDING'
        });

        await order.save();

        // Emit socket event if needed (optional here, usually handled in tracking)
        const io = req.app.get('io');
        // io.emit('new_order', order); // Notify mechanics if widespread

        res.status(201).json({
            success: true,
            data: order
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

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
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
// @access  Public
const getGarageOrders = async (req, res) => {
    try {
        const { garageId } = req.params;

        const orders = await Order.find({ garageId }).sort({ createdAt: -1 });

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

        const updateData = { updatedAt: new Date() };
        if (status) updateData.status = status;
        if (mechanicLocation) updateData.mechanicLocation = mechanicLocation;

        const order = await Order.findByIdAndUpdate(id, updateData, { new: true });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Emit Socket.io update to users tracking this order
        const io = req.app.get('io');
        io.to(id).emit('order_updated', order);
        if (mechanicLocation) {
            io.to(id).emit('location_updated', mechanicLocation);
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
