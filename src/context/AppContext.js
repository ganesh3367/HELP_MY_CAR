/**
 * AppContext.js
 * Manages global application state including mechanics list, orders, and favorites.
 * Handles API calls for fetching mechanics and order management with fallback mock data.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { TOWING_SERVICES } from '../constants/mockData';

const AppContext = createContext();

// Use your machine's IP (e.g., 192.168.x.x) if testing on physical device.
// For Simulators (iOS): localhost is fine.
// For Emulators (Android): 10.0.2.2 is required.
const API_URL = Platform.select({
    ios: 'http://172.20.10.11:5001/api', // Use local IP for physical device
    android: 'http://10.0.2.2:5001/api', // Standard Android emulator IP
    default: 'http://172.20.10.11:5001/api' // Default to local IP
});



// CLIENT-SIDE MOCK DATA FOR DEMO FALLBACK
const MOCK_MECHANICS = [
    {
        _id: '1',
        name: 'Quick Fix Motors',
        address: '123 Auto Lane',
        location: { type: 'Point', coordinates: [-122.4324, 37.78825] },
        lat: 37.78825,
        lng: -122.4324,
        phone: '+15550123',
        rating: 4.8,
        estimatedCost: '$20 - $100',
        specialties: ['Engine', 'Electrical', 'Battery', 'Car not starting'],
        vehicleTypes: ['Car', 'Truck'],
        experience: '5 Years',
        jobsCompleted: 350,
        reviews: [
            { id: 1, user: 'Rahul K.', rating: 5, comment: 'Fixed my engine in 30 mins. Super fast!', date: '2 days ago' },
            { id: 2, user: 'Sarah M.', rating: 4, comment: 'Good service but came a bit late.', date: '1 week ago' }
        ]
    },
    {
        _id: '2',
        name: 'Elite Auto Care',
        address: '456 Service Blvd',
        location: { type: 'Point', coordinates: [-122.4344, 37.78925] },
        lat: 37.78925,
        lng: -122.4344,
        phone: '+15550456',
        rating: 4.5,
        estimatedCost: '$30 - $150',
        specialties: ['Tyre', 'Alignment', 'Flat tire'],
        vehicleTypes: ['Car', 'Bike'],
        experience: '8 Years',
        jobsCompleted: 1200,
        reviews: [
            { id: 1, user: 'Amit S.', rating: 5, comment: 'Best tyre change service.', date: 'Yesterday' }
        ]
    },
    {
        _id: '3',
        name: 'MotoAssist 24/7',
        address: '789 Highway Rd',
        location: { type: 'Point', coordinates: [-122.4224, 37.79825] },
        lat: 37.79825,
        lng: -122.4224,
        phone: '+15550789',
        rating: 4.9,
        estimatedCost: '$50 - $200',
        specialties: ['Accident', 'Towing', 'Engine overheating'],
        vehicleTypes: ['Car', 'Truck', 'Bike'],
        experience: '12 Years',
        jobsCompleted: 2500,
        reviews: [
            { id: 1, user: 'John D.', rating: 5, comment: 'Lifesaver! Towed my car at 2 AM.', date: '3 days ago' },
            { id: 2, user: 'Priya R.', rating: 5, comment: 'Very professional.', date: '1 month ago' }
        ]
    }
];

export const AppProvider = ({ children }) => {
    const [mechanics, setMechanics] = useState([]);
    const [towingServices] = useState(TOWING_SERVICES);
    const [favorites, setFavorites] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMechanics();
    }, []);

    const fetchMechanics = async () => {
        try {
            // Default location (SF) for demo if location service fails
            const lat = 37.78825;
            const lng = -122.4324;

            // We pass these defaults to the API.
            // The backend is now updated to handle missing params gracefully too.


            // Add timeout to fail fast and switch to mock data
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

            const response = await fetch(`${API_URL}/garages/nearby?lat=${lat}&lng=${lng}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP Error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Normalize data: Ensure lat/lng exist from coordinates
                const normalizedMechanics = data.data.map(m => ({
                    ...m,
                    lat: m.location?.coordinates[1] || m.lat,
                    lng: m.location?.coordinates[0] || m.lng
                }));
                setMechanics(normalizedMechanics);
            }
        } catch (error) {
            console.warn('Network failed, using mock data');
            setMechanics(MOCK_MECHANICS); // Fallback to local mock
        }
    };

    /**
     * Places a new order for a mechanic.
     * @param {string} garageId - The ID of the selected garage.
     * @param {Object} vehicleDetails - Details of the user's vehicle.
     * @returns {Promise<Object>} The created order object.
     */
    const placeOrder = async (garageId, vehicleDetails, userLocation) => {
        setLoading(true);
        // Default location if not provided
        const loc = userLocation || { lat: 37.78825, lng: -122.4324 };

        try {
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: 'user_123', // Hardcoded for demo
                    garageId,
                    vehicleDetails,
                    userLocation: loc
                }),
            });
            const data = await response.json();
            if (data.success) {
                setCurrentOrder(data.data);
                return data.data;
            }
        } catch (error) {
            console.warn('Order API failed, using mock order');
            // Client-side mock order
            const mockOrder = {
                _id: 'local_mock_' + Date.now(),
                status: 'PENDING',
                garageId: MOCK_MECHANICS.find(m => m._id === garageId) || MOCK_MECHANICS[0],
                vehicleDetails,
                mechanicLocation: { lat: loc.lat - 0.01, lng: loc.lng - 0.01 },
                userLocation: loc
            };
            setCurrentOrder(mockOrder);
            return mockOrder;
        } finally {
            setLoading(false);
        }
    };

    const trackOrderStatus = async (orderId) => {
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}/track`);
            const data = await response.json();
            if (data.success) {
                setCurrentOrder(data.data);
                return data.data;
            }
        } catch (error) {
            console.log('Network failed, simulating local tracking:', error);
            if (currentOrder) {
                // Simulate movement locally
                const newOrder = { ...currentOrder };
                if (newOrder.status !== 'ARRIVED') {
                    const latDiff = newOrder.userLocation.lat - newOrder.mechanicLocation.lat;
                    const lngDiff = newOrder.userLocation.lng - newOrder.mechanicLocation.lng;

                    newOrder.mechanicLocation.lat += latDiff * 0.5;
                    newOrder.mechanicLocation.lng += lngDiff * 0.5;

                    if (Math.abs(latDiff) < 0.0005) {
                        newOrder.status = 'ARRIVED';
                    } else if (newOrder.status === 'PENDING') {
                        newOrder.status = 'ON_THE_WAY';
                    }
                }
                setCurrentOrder(newOrder);
                return newOrder;
            }
        }
    };

    const toggleFavorite = (id) => {
        setFavorites((prev) =>
            prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
        );
    };

    return (
        <AppContext.Provider
            value={{
                mechanics,
                towingServices,
                favorites,
                toggleFavorite,
                placeOrder,
                trackOrderStatus,
                currentOrder,
                loading
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
