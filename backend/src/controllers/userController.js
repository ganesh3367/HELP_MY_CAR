const { db } = require('../config/firebase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Register user
// @route   POST /api/users/signup
// @access  Public
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role, garageName, address, phone } = req.body;
        const userRole = role === 'garage' ? 'garage' : 'user';

        if (!db) {
            console.log('Firebase not initialized. Using MOCK MODE for signup.');
            return res.status(201).json({
                success: true,
                token: 'mock-token-' + Date.now(),
                data: { id: 'mock-user-id', name, email, role: userRole }
            });
        }

        // Check if user exists
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();
        if (doc.exists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user in Firestore
        const newUser = {
            name,
            email,
            password: hashedPassword,
            role: userRole,
            createdAt: new Date().toISOString()
        };

        // If role is garage, create a garage document
        if (userRole === 'garage') {
            const garageRef = db.collection('garages').doc();
            const newGarage = {
                ownerEmail: email,
                name: garageName || `${name}'s Garage`,
                address: address || 'Not Provided',
                phone: phone || 'Not Provided',
                // Default Indian Geolocation (Pune)
                location: { lat: 18.5204, lng: 73.8567 },
                rating: 0,
                estimatedCost: 'TBD',
                specialties: ['General Repair', 'Towing'],
                createdAt: new Date().toISOString()
            };

            const batch = db.batch();
            batch.set(userRef, newUser);
            batch.set(garageRef, newGarage);
            await batch.commit();
        } else {
            await userRef.set(newUser);
        }

        // Return response (excluding password)
        const userData = { id: email, name, email, role: userRole };
        sendTokenResponse(userData, 201, res);
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!db) {
            console.log('Firebase not initialized. Using MOCK MODE for login.');
            return res.status(200).json({
                success: true,
                token: 'mock-token-' + Date.now(),
                data: { id: 'mock-user-id', name: email.split('@')[0], email }
            });
        }

        // Check for user
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const user = doc.data();

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const userData = { id: email, name: user.name, email: user.email, role: user.role };
        sendTokenResponse(userData, 200, res);
    } catch (err) {
        console.error('Login Error:', err);
        res.status(400).json({ success: false, error: err.message });
    }
};

const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    res.status(statusCode).json({
        success: true,
        token,
        data: user
    });
};
