const Garage = require('../models/Garage');

// Haversine formula to compute distance in km
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

// @desc    Get garages within radius
// @route   GET /api/garages/nearby
// @access  Public
const getNearbyGarages = async (req, res) => {
    try {
        const { lat, lng, radius = 5 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Please provide latitude and longitude' });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        const garages = await Garage.find({
            location: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [userLng, userLat]
                    },
                    $maxDistance: parseFloat(radius) * 1000
                }
            }
        });

        const results = garages.map(g => {
            const doc = g.toObject();
            const garageLat = doc.location.coordinates[1];
            const garageLng = doc.location.coordinates[0];
            const distance = haversine(userLat, userLng, garageLat, garageLng);
            return {
                ...doc,
                id: doc._id,
                location: {
                    lat: garageLat,
                    lng: garageLng
                },
                distance: parseFloat(distance.toFixed(2))
            };
        });

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('Fetch Garages Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add review for a garage
// @route   POST /api/garages/:id/reviews
// @access  Public
const addReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;

        const garage = await Garage.findById(id);
        if (!garage) {
            return res.status(404).json({ success: false, message: 'Garage not found' });
        }

        // Simplistic review update for demo
        const newTotalRating = (garage.rating * garage.reviewCount) + parseFloat(rating);
        garage.reviewCount += 1;
        garage.rating = parseFloat((newTotalRating / garage.reviewCount).toFixed(1));

        await garage.save();

        res.status(200).json({
            success: true,
            data: garage
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
        await Garage.deleteMany({});

        const mockMechanics = [
            {
                name: 'Pune Auto Care',
                address: 'FC Road, Deccan Gymkhana, Pune',
                location: { type: 'Point', coordinates: [73.8412, 18.5167] },
                phone: '+91 20 2567 8901',
                rating: 4.7,
                reviewCount: 12,
                estimatedCost: '₹500 - ₹2000',
                specialties: ['General Service', 'Oil Change'],
                experience: '10 Years'
            },
            {
                name: 'Kothrud Mechanic Hub',
                address: 'Paud Road, Kothrud, Pune',
                location: { type: 'Point', coordinates: [73.8077, 18.5074] },
                phone: '+91 20 2543 2109',
                rating: 4.5,
                reviewCount: 8,
                estimatedCost: '₹300 - ₹1500',
                specialties: ['Brakes', 'Clutch Repair'],
                experience: '8 Years'
            },
            {
                name: 'Viman Nagar Auto Solutions',
                address: 'Symbiosis Road, Viman Nagar, Pune',
                location: { type: 'Point', coordinates: [73.9143, 18.5679] },
                phone: '+91 20 2663 4567',
                rating: 4.8,
                reviewCount: 15,
                estimatedCost: '₹800 - ₹5000',
                specialties: ['AC Service', 'Electrical'],
                experience: '12 Years'
            },
            {
                name: 'Hinjewadi Quick Fix',
                address: 'Phase 1, IT Park, Hinjewadi, Pune',
                location: { type: 'Point', coordinates: [73.7389, 18.5913] },
                phone: '+91 20 2293 8888',
                rating: 4.6,
                reviewCount: 5,
                estimatedCost: '₹400 - ₹2500',
                specialties: ['Tyre Change', 'Battery'],
                experience: '5 Years'
            },
            {
                name: 'Hadapsar Royal Mechanics',
                address: 'Magarpatta City, Hadapsar, Pune',
                location: { type: 'Point', coordinates: [73.9260, 18.5089] },
                phone: '+91 20 2689 9999',
                rating: 4.9,
                reviewCount: 20,
                estimatedCost: '₹1000 - ₹7000',
                specialties: ['Engine Overhaul', 'Painting'],
                experience: '15 Years'
            }
        ];

        await Garage.insertMany(mockMechanics);

        res.status(201).json({ success: true, message: 'Garages seeded successfully to MongoDB' });
    } catch (error) {
        console.error('Seed Error Detail:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get garage details for the owner
// @route   GET /api/garages/owner/:email
// @access  Public
const getGarageByOwner = async (req, res) => {
    try {
        const { email } = req.params;

        const garage = await Garage.findOne({ ownerEmail: email });

        if (!garage) {
            return res.status(404).json({ success: false, message: 'Garage not found for this owner email' });
        }

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
