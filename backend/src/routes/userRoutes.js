const express = require('express');
const { signup, login, deleteAccount } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.delete('/:email', deleteAccount);

module.exports = router;
