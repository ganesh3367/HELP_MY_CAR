const express = require('express');
const { signup, login, deleteAccount, googleLogin } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.delete('/:email', deleteAccount);

module.exports = router;
