const express = require('express');
const router = express.Router();
const { getNearbyGarages, seedGarages } = require('../controllers/garageController');

router.get('/nearby', getNearbyGarages);
router.post('/seed', seedGarages);

module.exports = router;
