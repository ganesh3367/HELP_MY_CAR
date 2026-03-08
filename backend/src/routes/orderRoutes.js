const express = require('express');
const router = express.Router();
const { createOrder, trackOrder, getGarageOrders, updateOrderStatus, getUserOrders } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/:id/track', trackOrder);
router.get('/garage/:garageId', getGarageOrders);
router.get('/user/:userId', getUserOrders);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
