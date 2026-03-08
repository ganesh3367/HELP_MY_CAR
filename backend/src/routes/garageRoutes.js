const express = require('express');
const router = express.Router();
const { getNearbyGarages, seedGarages, getGarageByOwner, addReview, updateGarage } = require('../controllers/garageController');

router.get('/nearby', getNearbyGarages);
router.post('/seed', seedGarages);
router.get('/owner/:email', getGarageByOwner);
router.patch('/:id', updateGarage);
router.post('/:id/reviews', addReview);

module.exports = router;
