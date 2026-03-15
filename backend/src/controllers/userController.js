const { db, auth } = require('../config/firebase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Google login
// @route   POST /api/users/google-login
// @access  Public
exports.googleLogin = async (req, res) => {
    try {
        const { idToken, role } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, error: 'idToken is required' });
        }

        if (!db || !auth) {
            console.log('Firebase not fully initialized. Using MOCK MODE for Google login.');
            // For mock mode, we assume the idToken is just an email or a mock string
            const email = idToken.includes('@') ? idToken : 'mock@example.com';
            const userData = {
                id: email,
                name: email.split('@')[0],
                email: email,
                role: (role || 'user').toLowerCase().trim() === 'garage' ? 'garage' : 'user',
                provider: 'google'
            };
            return sendTokenResponse(userData, 200, res);
        }

        // Verify Google idToken
        const decodedToken = await auth.verifyIdToken(idToken);
        const { email, name, picture } = decodedToken;

        // Check users collection
        let userRef = db.collection('users').doc(email);
        let doc = await userRef.get();

        // If not in users, check owners
        if (!doc.exists) {
            userRef = db.collection('owners').doc(email);
            doc = await userRef.get();
        }

        let userData;

        if (!doc.exists) {
            // New user - create account
            const normalizedRole = (role || 'user').toString().toLowerCase().trim();
            const userRole = normalizedRole === 'garage' ? 'garage' : 'user';
            const collectionName = userRole === 'garage' ? 'owners' : 'users';

            userRef = db.collection(collectionName).doc(email);
            userData = {
                name: name || email.split('@')[0],
                email,
                role: userRole,
                provider: 'google',
                avatar: picture,
                createdAt: new Date().toISOString()
            };

            await userRef.set(userData);
            userData.id = email;
        } else {
            // Existing user
            const existingUser = doc.data();
            userData = {
                id: email,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                avatar: existingUser.avatar || picture
            };

            // Check if garage profile exists if the user is an owner
            if (userData.role === 'garage') {
                const garageSnapshot = await db.collection('garages').where('ownerEmail', '==', email).limit(1).get();
                userData.hasGarageProfile = !garageSnapshot.empty;
            }
        }

        sendTokenResponse(userData, 200, res);
    } catch (err) {
        console.error('Google Login Error:', err);
        res.status(400).json({ success: false, error: err.message });
    }
};


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
            
            // In mock mode, assume they want a garage profile unless 'user' is in their email
            const isUserOnly = email.toLowerCase().includes('user');

            return res.status(200).json({
                success: true,
                token: 'mock-token-' + Date.now(),
                data: { 
                    id: email, 
                    name: email.split('@')[0], 
                    email,
                    role: isUserOnly ? 'user' : 'garage',
                    hasGarageProfile: !isUserOnly
                }
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

// @desc    Delete user account (and related garage if owner)
// @route   DELETE /api/users/:email
// @access  Public (Should be private in production)
exports.deleteAccount = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        if (!db) {
            // Mock mode: treat as success
            return res.status(200).json({ success: true, message: 'Account deleted (mock mode)' });
        }

        // Delete from users or owners collection
        const userRef = db.collection('users').doc(email);
        const ownerRef = db.collection('owners').doc(email);
        const [userDoc, ownerDoc] = await Promise.all([userRef.get(), ownerRef.get()]);

        const batch = db.batch();

        if (userDoc.exists) batch.delete(userRef);
        if (ownerDoc.exists) batch.delete(ownerRef);

        // If owner, also delete their garages
        if (ownerDoc.exists) {
            const garagesSnap = await db.collection('garages').where('ownerEmail', '==', email).get();
            garagesSnap.forEach((d) => batch.delete(d.ref));
        }

        await batch.commit();

        return res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Delete Account Error:', err);
        res.status(500).json({ success: false, error: err.message });
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
