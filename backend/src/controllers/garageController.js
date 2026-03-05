const { db } = require('../config/firebase');

// In-memory fallback
let MOCK_GARAGES = [
    {
        id: '1',
        name: 'Pune Auto Care',
        address: 'FC Road, Deccan Gymkhana, Pune',
        location: { lat: 18.5167, lng: 73.8412 },
        phone: '+91 20 2567 8901',
        rating: 4.8,
        estimatedCost: '₹500 - ₹2000',
        specialties: ['Engine', 'Electrical']
    },
    {
        id: '2',
        name: 'Kothrud Mechanic Hub',
        address: 'Paud Road, Kothrud, Pune',
        location: { lat: 18.5074, lng: 73.8077 },
        phone: '+91 20 2543 2109',
        rating: 4.5,
        estimatedCost: '₹300 - ₹1500',
        specialties: ['Tyre', 'Alignment']
    }
];

// Simple distance helper
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// @desc    Get garages within radius
// @route   GET /api/garages/nearby
// @access  Public
const getNearbyGarages = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!db) {
            console.log('Serving mock garages (Demo Mode)...');
            return res.status(200).json({
                success: true,
                count: MOCK_GARAGES.length,
                data: MOCK_GARAGES
            });
        }

        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Please provide latitude and longitude' });
        }

        // Fetch all garages from Firestore (for small demo)
        const snapshot = await db.collection('garages').get();
        let garages = [];

        // Use Promise.all to fetch reviews for all garages in parallel
        const garagesWithReviews = await Promise.all(snapshot.docs.map(async (doc) => {
            const garageData = { id: doc.id, ...doc.data() };

            // Get reviews sub-collection
            const reviewsSnapshot = await doc.ref.collection('reviews').get();
            const reviews = [];
            let totalRating = 0;

            reviewsSnapshot.forEach(rDoc => {
                const rData = { id: rDoc.id, ...rDoc.data() };
                reviews.push(rData);
                totalRating += rData.rating || 0;
            });

            const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : (garageData.rating || 0);

            return {
                ...garageData,
                reviews,
                rating: parseFloat(avgRating),
                reviewCount: reviews.length
            };
        }));

        garages = garagesWithReviews;

        // Filter and sort by distance in memory
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        garages = garages.map(g => ({
            ...g,
            distance: getDistance(userLat, userLng, g.location.lat, g.location.lng)
        }))
            .filter(g => g.distance <= 10) // 10km radius
            .sort((a, b) => a.distance - b.distance);

        res.status(200).json({
            success: true,
            count: garages.length,
            data: garages
        });
    } catch (error) {
        console.error('Fetch Garages Error:', error);
        res.status(200).json({ success: true, count: MOCK_GARAGES.length, data: MOCK_GARAGES });
    }
};

// @desc    Add review for a garage
// @route   POST /api/garages/:id/reviews
// @access  Public (Should be Private)
const addReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { user, rating, comment } = req.body;

        if (!db) {
            return res.status(200).json({ success: true, message: 'Mock Review Added' });
        }

        const review = {
            user: user || 'Anonymous',
            rating: parseFloat(rating) || 5,
            comment: comment || '',
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            createdAt: new Date().toISOString()
        };

        const garageRef = db.collection('garages').doc(id);
        const garageDoc = await garageRef.get();

        if (!garageDoc.exists) {
            return res.status(404).json({ success: false, message: 'Garage not found' });
        }

        await garageRef.collection('reviews').add(review);

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Add Review Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Seed initial garage data
// @route   POST /api/garages/seed
// @access  Public
const seedGarages = async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ success: false, message: 'Firebase not initialized' });
        }

        // Clear existing garages
        const existingGarages = await db.collection('garages').get();
        const deleteBatch = db.batch();
        existingGarages.docs.forEach(doc => deleteBatch.delete(doc.ref));
        await deleteBatch.commit();

        const mockMechanics = [
            {
                name: 'Pune Auto Care',
                address: 'FC Road, Deccan Gymkhana, Pune',
                location: { lat: 18.5167, lng: 73.8412 },
                phone: '+91 20 2567 8901',
                rating: 4.7,
                estimatedCost: '₹500 - ₹2000',
                specialties: ['General Service', 'Oil Change'],
                experience: '10 Years'
            },
            {
                name: 'Kothrud Mechanic Hub',
                address: 'Paud Road, Kothrud, Pune',
                location: { lat: 18.5074, lng: 73.8077 },
                phone: '+91 20 2543 2109',
                rating: 4.5,
                estimatedCost: '₹300 - ₹1500',
                specialties: ['Brakes', 'Clutch Repair'],
                experience: '8 Years'
            },
            {
                name: 'Viman Nagar Auto Solutions',
                address: 'Symbiosis Road, Viman Nagar, Pune',
                location: { lat: 18.5679, lng: 73.9143 },
                phone: '+91 20 2663 4567',
                rating: 4.8,
                estimatedCost: '₹800 - ₹5000',
                specialties: ['AC Service', 'Electrical'],
                experience: '12 Years'
            },
            {
                name: 'Hinjewadi Quick Fix',
                address: 'Phase 1, IT Park, Hinjewadi, Pune',
                location: { lat: 18.5913, lng: 73.7389 },
                phone: '+91 20 2293 8888',
                rating: 4.6,
                estimatedCost: '₹400 - ₹2500',
                specialties: ['Tyre Change', 'Battery'],
                experience: '5 Years'
            },
            {
                name: 'Hadapsar Royal Mechanics',
                address: 'Magarpatta City, Hadapsar, Pune',
                location: { lat: 18.5089, lng: 73.9260 },
                phone: '+91 20 2689 9999',
                rating: 4.9,
                estimatedCost: '₹1000 - ₹7000',
                specialties: ['Engine Overhaul', 'Painting'],
                experience: '15 Years'
            }
        ];

        const batch = db.batch();
        mockMechanics.forEach(mech => {
            const docRef = db.collection('garages').doc();
            batch.set(docRef, mech);
        });
        await batch.commit();

        res.status(201).json({ success: true, message: 'Garages seeded successfully to Firestore' });
    } catch (error) {
        console.error('Seed Error Detail:', error);
        res.status(500).json({ success: false, message: error.message, stack: error.stack });
    }
};

// @desc    Get garage details for the owner
// @route   GET /api/garages/owner/:email
// @access  Public (Should be Private in Prod)
const getGarageByOwner = async (req, res) => {
    try {
        const { email } = req.params;

        if (!db) {
            // Mock logic
            return res.status(200).json({
                success: true,
                data: MOCK_GARAGES[0] // Just return the first one for demo
            });
        }

        const snapshot = await db.collection('garages')
            .where('ownerEmail', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ success: false, message: 'Garage not found for this owner email' });
        }

        const garage = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

        res.status(200).json({
            success: true,
            data: garage
        });
    } catch (error) {
        console.error('Get Garage By Owner Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getNearbyGarages,
    seedGarages,
    getGarageByOwner,
    addReview
};
