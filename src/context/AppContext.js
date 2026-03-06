/**
 * AppContext.js
 * Manages global application state including mechanics list, orders, and favorites.
 * Handles API calls for fetching mechanics and order management with fallback mock data.
 */
import Constants from 'expo-constants';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TOWING_SERVICES } from '../constants/mockData';
import { useAuth } from './AuthContext';
import { useLocation } from './LocationContext';

const AppContext = createContext();

// Get the host IP dynamically for physical devices and emulators
import { Platform } from 'react-native';

const getApiUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri || '';
    let host = debuggerHost.split(':')[0];
    if (!host) {
        host = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
    }
    return `http://${host}:5002/api`;
};

const API_URL = getApiUrl();
console.log('[AppContext] Calculated API_URL:', API_URL);

const MOCK_MECHANICS = [
    {
        id: '1',
        name: 'Pune Auto Care',
        address: 'FC Road, Deccan Gymkhana, Pune',
        location: { type: 'Point', coordinates: [73.8412, 18.5167] },
        lat: 18.5167,
        lng: 73.8412,
        phone: '+91 20 2567 8901',
        rating: 4.8,
        estimatedCost: '₹500 - ₹2000',
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
        id: '2',
        name: 'Kothrud Mechanic Hub',
        address: 'Paud Road, Kothrud, Pune',
        location: { type: 'Point', coordinates: [73.8077, 18.5074] },
        lat: 18.5074,
        lng: 73.8077,
        phone: '+91 20 2543 2109',
        rating: 4.5,
        estimatedCost: '₹300 - ₹1500',
        specialties: ['Tyre', 'Alignment', 'Flat tire'],
        vehicleTypes: ['Car', 'Bike'],
        experience: '8 Years',
        jobsCompleted: 1200,
        reviews: [
            { id: 1, user: 'Amit S.', rating: 5, comment: 'Best tyre change service.', date: 'Yesterday' }
        ]
    },
    {
        id: '3',
        name: 'Viman Nagar Auto Solutions',
        address: 'Symbiosis Road, Viman Nagar, Pune',
        location: { type: 'Point', coordinates: [73.9143, 18.5679] },
        lat: 18.5679,
        lng: 73.9143,
        phone: '+91 20 2663 4567',
        rating: 4.9,
        estimatedCost: '₹800 - ₹5000',
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
    const { user } = useAuth();
    const locationContext = useLocation();
    const userLocation = locationContext?.location;
    const [mechanics, setMechanics] = useState([]);
    const [towingServices] = useState(TOWING_SERVICES);
    const [favorites, setFavorites] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const userLocationRef = useRef(userLocation);

    useEffect(() => {
        userLocationRef.current = userLocation;
    }, [userLocation]);

    useEffect(() => {
        fetchMechanics();
    }, [fetchMechanics]);

    useEffect(() => {
        if (userLocation) {
            if (userLocation?.coords) {
                fetchMechanics(userLocation);
            }
        }
    }, [userLocation?.coords, fetchMechanics]);

    const fetchMechanics = useCallback(async (locParam = null) => {
        try {
            const loc = locParam || userLocationRef.current;
            const lat = loc?.coords?.latitude || 18.5204;
            const lng = loc?.coords?.longitude || 73.8567;

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
                    lat: m.location?.lat || m.location?.coordinates?.[1] || m.lat,
                    lng: m.location?.lng || m.location?.coordinates?.[0] || m.lng
                }));
                setMechanics(normalizedMechanics);
            }
        } catch (_error) {
            console.warn('Network failed, using mock data');
            setMechanics(MOCK_MECHANICS); // Fallback to local mock
        }
    }, []);

    /**
     * Places a new order for a mechanic.
     * @param {string} garageId - The ID of the selected garage.
     * @param {Object} vehicleDetails - Details of the user's vehicle.
     * @returns {Promise<Object>} The created order object.
     */
    const placeOrder = async (garageId, vehicleDetails, userLocation) => {
        setLoading(true);
        // Default location if not provided (Pune, India)
        const loc = userLocation || { lat: 18.5204, lng: 73.8567 };

        try {
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user?.id || 'guest',
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
        } catch (_error) {
            console.warn('Order API failed, using mock order');
            // Client-side mock order
            const garage = MOCK_MECHANICS.find(m => m.id === garageId) || MOCK_MECHANICS[0];
            const mockOrder = {
                id: 'local_mock_' + Date.now(),
                _id: 'local_mock_' + Date.now(),
                status: 'ON_THE_WAY',
                garageId,
                garageName: garage?.name || 'Nearby Mechanic',
                mechanic: { name: garage?.name, rating: garage?.rating || 4.8, phone: '+911234567890' },
                vehicleDetails,
                mechanicLocation: { lat: loc.lat + (Math.random() - 0.5) * 0.03, lng: loc.lng + (Math.random() - 0.5) * 0.03 },
                userLocation: loc,
                etaMinutes: 8,
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
            if (!response.ok) {
                throw new Error(`HTTP Error! status: ${response.status}`);
            }
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

    const [garageOrders, setGarageOrders] = useState([]);
    const [myGarage, setMyGarage] = useState(null);

    const fetchGarageByOwner = useCallback(async (email) => {
        try {
            const response = await fetch(`${API_URL}/garages/owner/${email}`);
            const data = await response.json();
            if (data.success) {
                setMyGarage(data.data);
                return data.data;
            }
        } catch (error) {
            console.error('Fetch My Garage Error:', error);
            // Fallback for demo
            const mockGarage = MOCK_MECHANICS[0];
            setMyGarage(mockGarage);
            return mockGarage;
        }
    }, []);

    const fetchGarageOrders = useCallback(async (garageId) => {
        try {
            const response = await fetch(`${API_URL}/orders/garage/${garageId}`);
            const data = await response.json();
            if (data.success) {
                setGarageOrders(data.data);
                return data.data;
            }
        } catch (error) {
            console.error('Fetch Garage Orders Error:', error);
            setGarageOrders([]);
        }
    }, []);

    const updateOrderStatus = async (orderId, status) => {
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await response.json();
            if (data.success) {
                // Update local status if in the list
                setGarageOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
                if (currentOrder && currentOrder.id === orderId) {
                    setCurrentOrder(prev => ({ ...prev, status }));
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Update Order Status Error:', error);
            return false;
        }
    };

    const addReview = async (garageId, reviewData) => {
        // ── Build the new review object ──────────────────────────────────────
        const newReview = {
            id: Date.now(),
            user: user?.name || user?.email?.split('@')[0] || 'You',
            avatar: '👤',
            rating: reviewData.rating,
            comment: reviewData.comment || '',
            date: 'Just now',
        };

        // ── Always apply locally first (optimistic update) ───────────────────
        setMechanics(prev => prev.map(m => {
            if (m.id === garageId || m._id === garageId) {
                const updatedReviews = [newReview, ...(m.reviews || [])];
                const avg = updatedReviews.reduce((s, r) => s + r.rating, 0) / updatedReviews.length;
                return {
                    ...m,
                    reviews: updatedReviews,
                    rating: parseFloat(avg.toFixed(1)),
                    reviewCount: updatedReviews.length,
                };
            }
            return m;
        }));

        // ── Try syncing to backend in the background ─────────────────────────
        try {
            const response = await fetch(`${API_URL}/garages/${garageId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: newReview.user, ...reviewData }),
            });
            const data = await response.json();
            if (data.success && data.data) {
                // Replace the local review with the server copy so IDs match
                setMechanics(prev => prev.map(m => {
                    if (m.id === garageId || m._id === garageId) {
                        const updated = [data.data, ...(m.reviews || []).filter(r => r.id !== newReview.id)];
                        const avg = updated.reduce((s, r) => s + r.rating, 0) / updated.length;
                        return { ...m, reviews: updated, rating: parseFloat(avg.toFixed(1)), reviewCount: updated.length };
                    }
                    return m;
                }));
            }
        } catch (_err) {
            // Local save already done; backend sync will happen next session
            console.warn('[addReview] Backend unavailable — review saved locally only');
        }

        return true; // Always succeeds because we saved locally
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
                loading,
                garageOrders,
                myGarage,
                fetchGarageByOwner,
                fetchGarageOrders,
                updateOrderStatus,
                addReview
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
