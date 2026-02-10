const express = require('express');
const router = express.Router();
const { createOrder, trackOrder } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/:id/track', trackOrder);

module.exports = router;
