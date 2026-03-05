const express = require('express');
const router = express.Router();
const { createOrder, trackOrder, getGarageOrders, updateOrderStatus } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/:id/track', trackOrder);
router.get('/garage/:garageId', getGarageOrders);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
