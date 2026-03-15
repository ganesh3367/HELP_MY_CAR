const express = require('express');
const router = express.Router();
const { getNearbyGarages, getAllGarages, seedGarages, getGarageByOwner, addReview, updateGarage, createGarage } = require('../controllers/garageController');

router.get('/nearby', getNearbyGarages);
router.get('/all', getAllGarages);
router.post('/seed', seedGarages);
router.get('/owner/:email', getGarageByOwner);
router.post('/', createGarage);
router.patch('/:id', updateGarage);
router.post('/:id/reviews', addReview);

module.exports = router;
