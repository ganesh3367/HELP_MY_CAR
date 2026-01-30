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
    ios: 'http://localhost:5000/api',
    android: 'http://10.0.2.2:5000/api',
    default: 'http://localhost:5000/api'
});

console.log('Using API URL:', API_URL);

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
        specialties: ['Engine', 'Electrical']
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
        specialties: ['Tyre', 'Alignment']
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
            console.log(`Fetching mechanics from: ${API_URL}/garages/nearby`);

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
                setMechanics(data.data);
            }
        } catch (error) {
            console.error('Network failed, using client-side mock data:', error);
            setMechanics(MOCK_MECHANICS); // Fallback to local mock
        }
    };

    /**
     * Places a new order for a mechanic.
     * @param {string} garageId - The ID of the selected garage.
     * @param {Object} vehicleDetails - Details of the user's vehicle.
     * @returns {Promise<Object>} The created order object.
     */
    const placeOrder = async (garageId, vehicleDetails) => {
        setLoading(true);
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
                    userLocation: { lat: 37.78825, lng: -122.4324 }
                }),
            });
            const data = await response.json();
            if (data.success) {
                setCurrentOrder(data.data);
                return data.data;
            }
        } catch (error) {
            console.error('Network failed, creating local mock order:', error);
            // Client-side mock order
            const mockOrder = {
                _id: 'local_mock_' + Date.now(),
                status: 'PENDING',
                garageId: MOCK_MECHANICS.find(m => m._id === garageId) || MOCK_MECHANICS[0],
                vehicleDetails,
                mechanicLocation: { lat: 37.78825 - 0.01, lng: -122.4324 - 0.01 },
                userLocation: { lat: 37.78825, lng: -122.4324 }
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

                    newOrder.mechanicLocation.lat += latDiff * 0.1;
                    newOrder.mechanicLocation.lng += lngDiff * 0.1;

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
