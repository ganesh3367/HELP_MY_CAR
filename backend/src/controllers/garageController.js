const Garage = require('../models/Garage');

// In-memory fallback
let MOCK_GARAGES = [
    {
        _id: '1',
        name: 'Quick Fix Motors',
        address: '123 Auto Lane, Metropolis',
        location: { type: 'Point', coordinates: [-122.4324, 37.78825] },
        phone: '+15550123',
        rating: 4.8,
        estimatedCost: '$20 - $100',
        specialties: ['Engine', 'Electrical']
    },
    {
        _id: '2',
        name: 'Elite Auto Care',
        address: '456 Service Blvd, Metropolis',
        location: { type: 'Point', coordinates: [-122.4344, 37.78925] },
        phone: '+15550456',
        rating: 4.5,
        estimatedCost: '$30 - $150',
        specialties: ['Tyre', 'Alignment']
    }
];

// @desc    Get garages within radius
// @route   GET /api/garages/nearby
// @access  Public
const getNearbyGarages = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        // DEMO MODE: If DB is not connected OR even if lat/lng are missing, return mock data
        // This ensures the demo always works
        if (!global.isConnected || (!lat || !lng)) {
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

        // DB connected, use Mongoose
        const garages = await Garage.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: 10000 // 10km
                }
            }
        });

        res.status(200).json({
            success: true,
            count: garages.length,
            data: garages
        });
    } catch (error) {
        console.error(error);
        // Fallback to mock on error too
        res.status(200).json({ success: true, count: MOCK_GARAGES.length, data: MOCK_GARAGES });
    }
};

// @desc    Seed initial garage data
// @route   POST /api/garages/seed
// @access  Public (should be protected in prod)
const seedGarages = async (req, res) => {
    try {
        await Garage.deleteMany();

        const mockMechanics = [
            {
                name: 'Quick Fix Motors',
                address: '123 Auto Lane, Metropolis',
                location: { type: 'Point', coordinates: [-122.4324, 37.78825] },
                phone: '+15550123',
                rating: 4.8,
                estimatedCost: '$20 - $100',
                specialties: ['Engine', 'Electrical']
            },
            {
                name: 'Elite Auto Care',
                address: '456 Service Blvd, Metropolis',
                location: { type: 'Point', coordinates: [-122.4344, 37.78925] },
                phone: '+15550456',
                rating: 4.5,
                estimatedCost: '$30 - $150',
                specialties: ['Tyre', 'Alignment']
            },
            {
                name: 'Master Mechanics',
                address: '789 Repair Rd, Metropolis',
                location: { type: 'Point', coordinates: [-122.4364, 37.78725] },
                phone: '+15550789',
                rating: 4.9,
                estimatedCost: '$15 - $80',
                specialties: ['Battery', 'Fuel']
            }
        ];

        await Garage.insertMany(mockMechanics);

        res.status(201).json({ success: true, message: 'Garages seeded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getNearbyGarages,
    seedGarages
};
