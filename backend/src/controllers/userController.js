const { db } = require('../config/firebase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Register user
// @route   POST /api/users/signup
// @access  Public
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Robust role parsing
        const normalizedRole = (role || 'user').toString().toLowerCase().trim();
        const userRole = normalizedRole === 'garage' ? 'garage' : 'user';
        const collectionName = userRole === 'garage' ? 'owners' : 'users';

        console.log(`[Signup] Attempting signup for ${email}. Role: ${userRole}, Target Collection: ${collectionName}`);

        if (!db) {
            console.log(`Firebase not initialized. Using MOCK MODE for signup in ${collectionName}.`);
            return res.status(201).json({
                success: true,
                token: 'mock-token-' + Date.now(),
                data: { id: 'mock-user-id', name, email, role: userRole }
            });
        }

        // Check if user exists in the specific collection
        const userRef = db.collection(collectionName).doc(email);
        const doc = await userRef.get();
        if (doc.exists) {
            return res.status(400).json({ success: false, error: 'Account already exists' });
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

        await userRef.set(newUser);

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

        // Check users collection first
        let userRef = db.collection('users').doc(email);
        let doc = await userRef.get();

        // If not in users, check owners
        if (!doc.exists) {
            userRef = db.collection('owners').doc(email);
            doc = await userRef.get();
        }

        if (!doc.exists) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const user = doc.data();

        // Check if garage profile exists if the user is an owner
        let hasGarageProfile = false;
        if (user.role === 'garage') {
            const garageSnapshot = await db.collection('garages').where('ownerEmail', '==', email).limit(1).get();
            hasGarageProfile = !garageSnapshot.empty;
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const userData = {
            id: email,
            name: user.name,
            email: user.email,
            role: user.role,
            hasGarageProfile
        };
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
