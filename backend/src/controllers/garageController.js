const { db } = require('../config/firebase');


const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

let MOCK_GARAGES = [
    {
        id: 'mock-1',
        name: 'Pune Auto Care',
        address: 'FC Road, Deccan Gymkhana, Pune',
        location: { lat: 18.5167, lng: 73.8412 },
        phone: '+91 20 2567 8901',
        rating: 4.7,
        reviewCount: 12,
        estimatedCost: '₹500 - ₹2000',
        specialties: ['General Service', 'Oil Change'],
        experience: '10 Years'
    },
    {
        id: 'mock-2',
        name: 'Kothrud Mechanic Hub',
        address: 'Paud Road, Kothrud, Pune',
        location: { lat: 18.5074, lng: 73.8077 },
        phone: '+91 20 2543 2109',
        rating: 4.5,
        reviewCount: 8,
        estimatedCost: '₹300 - ₹1500',
        specialties: ['Brakes', 'Clutch Repair'],
        experience: '8 Years'
    }
];




const getNearbyGarages = async (req, res) => {
    try {
        const { lat, lng, radius = 50 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Please provide latitude and longitude' });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        let garages = [];

        if (!db) {
            console.log('Firebase not initialized. Using MOCK GARAGES.');
            garages = MOCK_GARAGES;
        } else {
            const snapshot = await db.collection('garages').get();
            garages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        let results = garages.map(g => {
            const garageLat = g.location?.lat || g.lat || 18.5204;
            const garageLng = g.location?.lng || g.lng || 73.8567;
            const distance = haversine(userLat, userLng, garageLat, garageLng);
            return {
                ...g,
                distance: parseFloat(distance.toFixed(2))
            };
        }).sort((a, b) => a.distance - b.distance);

        
        const filtered = results.filter(g => g.distance <= parseFloat(radius));
        const finalData = filtered.length > 0 ? filtered : results.slice(0, 10);

        res.status(200).json({
            success: true,
            count: finalData.length,
            data: finalData
        });
    } catch (error) {
        console.error('Fetch Garages Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};




const getAllGarages = async (req, res) => {
    try {
        let garages = [];

        if (!db) {
            garages = MOCK_GARAGES;
        } else {
            const snapshot = await db.collection('garages').get();
            garages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            
            garages = garages.map(g => ({
                ...g,
                lat: g.location?.lat || g.lat || 18.5204,
                lng: g.location?.lng || g.lng || 73.8567
            }));
        }

        res.status(200).json({
            success: true,
            count: garages.length,
            data: garages
        });
    } catch (error) {
        console.error('Fetch All Garages Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};




const addReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;

        if (!db) {
            return res.status(200).json({ success: true, message: 'Mock review added (Firebase disabled)' });
        }

        const garageRef = db.collection('garages').doc(id);
        const doc = await garageRef.get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Garage not found' });
        }

        const garage = doc.data();
        const reviewCount = (garage.reviewCount || 0) + 1;
        const currentRating = garage.rating || 0;
        const newRating = parseFloat(((currentRating * (reviewCount - 1) + parseFloat(rating)) / reviewCount).toFixed(1));

        await garageRef.update({
            reviewCount,
            rating: newRating
        });

        res.status(200).json({
            success: true,
            data: { ...garage, id, reviewCount, rating: newRating }
        });
    } catch (error) {
        console.error('Add Review Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};




const seedGarages = async (req, res) => {
    try {
        const mockMechanics = [
            {
                name: 'Pune Auto Care',
                address: 'FC Road, Deccan Gymkhana, Pune',
                location: { lat: 18.5167, lng: 73.8412 },
                phone: '+91 20 2567 8901',
                rating: 4.7,
                reviewCount: 12,
                estimatedCost: '₹500 - ₹2000',
                specialties: ['General Service', 'Oil Change'],
                experience: '10 Years',
                createdAt: new Date().toISOString()
            },
            {
                name: 'Kothrud Mechanic Hub',
                address: 'Paud Road, Kothrud, Pune',
                location: { lat: 18.5074, lng: 73.8077 },
                phone: '+91 20 2543 2109',
                rating: 4.5,
                reviewCount: 8,
                estimatedCost: '₹300 - ₹1500',
                specialties: ['Brakes', 'Clutch Repair'],
                experience: '8 Years',
                createdAt: new Date().toISOString()
            },
            {
                name: 'Viman Nagar Auto Solutions',
                address: 'Symbiosis Road, Viman Nagar, Pune',
                location: { lat: 18.5679, lng: 73.9143 },
                phone: '+91 20 2663 4567',
                rating: 4.8,
                reviewCount: 15,
                estimatedCost: '₹800 - ₹5000',
                specialties: ['AC Service', 'Electrical'],
                experience: '12 Years',
                createdAt: new Date().toISOString()
            }
        ];

        if (!db) {
            return res.status(201).json({ success: true, message: 'Garages seeded successfully to MOCK MODE' });
        }

        const batch = db.batch();
        mockMechanics.forEach(mech => {
            const ref = db.collection('garages').doc();
            batch.set(ref, mech);
        });
        await batch.commit();

        res.status(201).json({ success: true, message: 'Garages seeded successfully to Firestore' });
    } catch (error) {
        console.error('Seed Error Detail:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};




const getGarageByOwner = async (req, res) => {
    try {
        const { email } = req.params;

        if (!db) {
            const mockGarage = MOCK_GARAGES.find(g => g.ownerEmail === email) || MOCK_GARAGES[0];
            return res.status(200).json({
                success: true,
                data: mockGarage
            });
        }

        const snapshot = await db.collection('garages').where('ownerEmail', '==', email).limit(1).get();

        if (snapshot.empty) {
            return res.status(404).json({ success: false, message: 'Garage not found for this owner email' });
        }

        const doc = snapshot.docs[0];
        res.status(200).json({
            success: true,
            data: { id: doc.id, ...doc.data() }
        });
    } catch (error) {
        console.error('Get Garage By Owner Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};




const updateGarage = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, updatedAt: new Date().toISOString() };

        if (!db) {
            return res.status(200).json({
                success: true,
                data: { id, ...updateData }
            });
        }

        const garageRef = db.collection('garages').doc(id);
        const doc = await garageRef.get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Garage not found' });
        }

        await garageRef.update(updateData);
        const updatedDoc = await garageRef.get();

        res.status(200).json({
            success: true,
            data: { id: updatedDoc.id, ...updatedDoc.data() }
        });
    } catch (error) {
        console.error('Update Garage Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};




const createGarage = async (req, res) => {
    try {
        const {
            ownerEmail,
            name,
            address,
            phone,
            experience,
            estimatedCost,
            rating,
            specialties,
            location
        } = req.body;

        if (!ownerEmail || !name || !location) {
            return res.status(400).json({ success: false, message: 'Please provide email, name, and location' });
        }

        if (!db) {
            const newMockGarage = { id: 'mock-id-' + Date.now(), ...req.body };
            
            MOCK_GARAGES.push(newMockGarage);
            return res.status(201).json({
                success: true,
                data: newMockGarage
            });
        }

        const newGarage = {
            ownerEmail,
            name,
            address: address || 'Not Provided',
            phone: phone || 'Not Provided',
            experience: experience || 'Not Provided',
            estimatedCost: estimatedCost || 'TBD',
            rating: parseFloat(rating) || 5.0,
            reviewCount: 1,
            specialties: specialties || [],
            location: {
                lat: parseFloat(location.lat),
                lng: parseFloat(location.lng)
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const docRef = await db.collection('garages').add(newGarage);

        res.status(201).json({
            success: true,
            data: { id: docRef.id, ...newGarage }
        });
    } catch (error) {
        console.error('Create Garage Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getNearbyGarages,
    getAllGarages,
    seedGarages,
    getGarageByOwner,
    createGarage,
    updateGarage,
    addReview
};
