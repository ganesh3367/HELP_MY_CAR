/**
 * AppContext.js
 * Manages global application state including mechanics list, orders, and favorites.
 * Handles API calls for fetching mechanics and order management with fallback mock data.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { API_URL } from '../config';
import { TOWING_SERVICES } from '../constants/mockData';
import { fetchWithRetry } from '../services/api';
import {
    connectSocket,
    disconnectSocket,
    joinGarage,
    offNewOrder,
    onNewOrder
} from '../services/socket';
import { useAuth } from './AuthContext';
import { useLocation } from './LocationContext';

const AppContext = createContext();


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
    const [towingServices, setTowingServices] = useState(TOWING_SERVICES);
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

    const [userOrders, setUserOrders] = useState([]);
    const [unreadOrders, setUnreadOrders] = useState([]);

    // Persistence: Load on mount
    useEffect(() => {
        const loadPersistedData = async () => {
            try {
                const storedOrder = await AsyncStorage.getItem('currentOrder');
                if (storedOrder) {
                    try {
                        const parsed = JSON.parse(storedOrder);
                        // Only load if it's an active status
                        if (parsed && ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(parsed.status)) {
                            setCurrentOrder(parsed);
                        } else {
                            await AsyncStorage.removeItem('currentOrder');
                        }
                    } catch (e) {
                        console.warn('Failed to parse stored order', e);
                        await AsyncStorage.removeItem('currentOrder');
                    }
                }

                const storedGarage = await AsyncStorage.getItem('myGarage');
                if (storedGarage) {
                    try {
                        setMyGarage(JSON.parse(storedGarage));
                    } catch (e) {
                        console.warn('Failed to parse stored garage', e);
                    }
                }
            } catch (e) {
                console.warn('Failed to load persisted app data', e);
            }
        };
        loadPersistedData();
    }, []);

    // Persistence: Save on change
    useEffect(() => {
        if (currentOrder) {
            AsyncStorage.setItem('currentOrder', JSON.stringify(currentOrder));
        } else {
            AsyncStorage.removeItem('currentOrder');
        }
    }, [currentOrder]);

    useEffect(() => {
        if (myGarage) {
            AsyncStorage.setItem('myGarage', JSON.stringify(myGarage));
        } else {
            AsyncStorage.removeItem('myGarage');
        }
    }, [myGarage]);

    useEffect(() => {
        if (user?.role === 'garage' && myGarage?.id) {
            connectSocket();
            joinGarage(myGarage.id);

            onNewOrder((newOrder) => {
                setUnreadOrders(prev => [newOrder, ...prev]);
                fetchGarageOrders(myGarage.id);
            });

            return () => {
                offNewOrder();
                disconnectSocket();
            };
        }
    }, [user?.role, myGarage?.id, fetchGarageOrders]);

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

            const response = await fetchWithRetry(`${API_URL}/garages/nearby?lat=${lat}&lng=${lng}`);

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

                // Dynamically update towing services from mechanics who offer it
                const dynamicTowing = normalizedMechanics
                    .filter(m => m.specialties?.some(s => s.toLowerCase().includes('towing')))
                    .map(m => ({
                        id: m.id || m._id,
                        type: m.name,
                        costPerKm: '₹20-50',
                        availability: 'Available',
                        phone: m.phone,
                        rating: m.rating,
                        lat: m.lat,
                        lng: m.lng,
                        isGarage: true
                    }));

                setTowingServices([...TOWING_SERVICES, ...dynamicTowing]);
            }
        } catch (error) {
            console.warn(`[fetchMechanics] All retries failed for ${API_URL}/garages/nearby:`, error.message);
            setMechanics(MOCK_MECHANICS);
            setTowingServices(TOWING_SERVICES); // Fallback to basic mock
        }
    }, []);

    /**
     * Places a new order for a mechanic.
     * @param {string} garageId - The ID of the selected garage.
     * @param {Object} vehicleDetails - Details of the user's vehicle.
     * @returns {Promise<Object>} The created order object.
     */
    const placeOrder = async (garageId, vehicleDetails, userLocation) => {
        // Enforce single active order constraint
        if (currentOrder && ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(currentOrder.status)) {
            throw new Error('You already have an active order. Please complete or cancel it first.');
        }

        setLoading(true);

        try {
            const response = await fetchWithRetry(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user?.id || 'guest',
                    userName: user?.name || 'Guest User',
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
                status: 'PENDING', // Start with PENDING
                garageId,
                garageName: garage?.name || 'Nearby Mechanic',
                mechanic: { name: garage?.name, rating: garage?.rating || 4.8, phone: '+911234567890' },
                vehicleDetails,
                mechanicLocation: {
                    lat: loc.lat + (Math.random() - 0.5) * 0.05,
                    lng: loc.lng + (Math.random() - 0.5) * 0.05
                },
                userLocation: loc,
                etaMinutes: 12,
            };

            // Auto-advance mock order status for better UX
            setTimeout(() => {
                setCurrentOrder(prev => prev?.id === mockOrder.id ? { ...prev, status: 'ACCEPTED' } : prev);
                setTimeout(() => {
                    setCurrentOrder(prev => prev?.id === mockOrder.id ? { ...prev, status: 'ON_THE_WAY', etaMinutes: 8 } : prev);
                }, 3000);
            }, 3000);

            setCurrentOrder(mockOrder);
            return mockOrder;
        } finally {
            setLoading(false);
        }
    };

    const trackOrderStatus = async (orderId) => {
        try {
            const response = await fetchWithRetry(`${API_URL}/orders/${orderId}/track`);
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


    const fetchUserOrders = async (userId) => {
        try {
            const response = await fetchWithRetry(`${API_URL}/orders/user/${userId}`);
            const data = await response.json();
            if (data.success) {
                setUserOrders(data.data);
            }
        } catch (error) {
            console.error('Fetch User Orders Error:', error);
        }
    };

    const updateGarageProfile = async (garageId, updateData) => {
        setLoading(true);
        try {
            const response = await fetchWithRetry(`${API_URL}/garages/${garageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });
            const data = await response.json();
            if (data.success) {
                setMyGarage(data.data);
                return true;
            }
            return false;
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Update Garage Profile Error:', error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const toggleGarageStatus = async (garageId, isOnline) => {
        return await updateGarageProfile(garageId, { isOnline });
    };

    const createGarage = async (garageData) => {
        setLoading(true);
        try {
            const response = await fetchWithRetry(`${API_URL}/garages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(garageData),
            });
            const data = await response.json();
            if (data.success) {
                setMyGarage(data.data);
                // Mark profile as complete in the user object to open the gate
                if (user) {
                    user.hasGarageProfile = true;
                }
                // Also refresh mechanics list to include the newly created one
                fetchMechanics();
                return true;
            }
            return false;
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Create Garage Error:', error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteGarage = async (garageId) => {
        setLoading(true);
        try {
            const response = await fetchWithRetry(`${API_URL}/garages/${garageId}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                setMyGarage(null);
                fetchMechanics();
                return true;
            }
            return false;
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Delete Garage Error:', error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const submitFeedback = async (feedbackData) => {
        try {
            const response = await fetchWithRetry(`${API_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    userName: user?.name,
                    email: user?.email,
                    ...feedbackData
                })
            });
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Submit Feedback Error:', error);
            return false;
        }
    };

    const [garageOrders, setGarageOrders] = useState([]);
    const [myGarage, setMyGarage] = useState(null);

    const fetchGarageByOwner = useCallback(async (email) => {
        try {
            const response = await fetchWithRetry(`${API_URL}/garages/owner/${email}`);
            const data = await response.json();
            if (data.success) {
                setMyGarage(data.data);
                return data.data;
            }
            setMyGarage(null);
            return null;
        } catch (error) {
            console.error('Fetch My Garage Error:', error);
            setMyGarage(null);
            return null;
        }
    }, []);

    const fetchGarageOrders = useCallback(async (garageId) => {
        try {
            const response = await fetchWithRetry(`${API_URL}/orders/garage/${garageId}`);
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
            const response = await fetchWithRetry(`${API_URL}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await response.json();
            if (data.success) {
                // Update local status if in the list
                setGarageOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId) ? { ...o, status } : o));
                if (currentOrder && (currentOrder.id === orderId || currentOrder._id === orderId)) {
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

    const cancelOrder = async (orderId) => {
        const success = await updateOrderStatus(orderId, 'CANCELLED');
        if (success) {
            setCurrentOrder(null);
            await AsyncStorage.removeItem('currentOrder');
        }
        return success;
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
            const response = await fetchWithRetry(`${API_URL}/garages/${garageId}/reviews`, {
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
                cancelOrder,
                addReview,
                userOrders,
                fetchUserOrders,
                updateGarageProfile,
                toggleGarageStatus,
                createGarage,
                deleteGarage,
                submitFeedback,
                unreadOrders,
                clearUnreadOrders: () => setUnreadOrders([])
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
