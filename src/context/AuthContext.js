/**
 * AuthContext.js
 * Manages user authentication state including login, signup, and logout/
 * Persists user state using AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { API_URL } from '../config';
import { fetchWithRetry } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                const storedToken = await AsyncStorage.getItem('token');
                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                }
            } catch (error) {
                console.error('Failed to load user', error);
            } finally {
                setIsInitializing(false);
            }
        };
        checkUser();
    }, []);

    /**
     * Logs in the user.
     */
    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await fetchWithRetry(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const contentType = response.headers.get('content-type') || '';
            let data;
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const errorText = await response.text();
                throw new Error(`Server returned non-JSON response (Status: ${response.status}). Backend might be waking up or offline.`);
            }

            if (data.success) {
                const userData = data.data;
                const userToken = data.token;
                await AsyncStorage.setItem('user', JSON.stringify(userData));
                await AsyncStorage.setItem('token', userToken);
                setUser(userData);
                setToken(userToken);
                return userData;
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            const message = error.name === 'AbortError' ? 'Server timeout. Please try again.' : error.message;
            console.error('Login error:', message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Registers a new user.
     */
    const signup = async (name, email, password, role = 'user', garageDetails = null) => {
        setLoading(true);
        try {
            const bodyPayload = { name, email, password, role: role.trim().toLowerCase() };
            if (role === 'garage' && garageDetails) {
                Object.assign(bodyPayload, garageDetails);
            }

            console.log('[Auth] signup request', { url: `${API_URL}/users/signup`, role: bodyPayload.role });
            const response = await fetchWithRetry(`${API_URL}/users/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload),
            });

            const contentType = response.headers.get('content-type') || '';
            let data;
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const errorText = await response.text();
                throw new Error(`Server returned non-JSON response (Status: ${response.status}). Backend might be waking up or offline.`);
            }

            if (data.success) {
                const userData = data.data;
                const userToken = data.token;
                await AsyncStorage.setItem('user', JSON.stringify(userData));
                await AsyncStorage.setItem('token', userToken);
                setUser(userData);
                setToken(userToken);
                return userData;
            } else {
                throw new Error(data.error || 'Signup failed');
            }
        } catch (error) {
            const message = error.name === 'AbortError' ? 'Server timeout during signup. Please try again.' : error.message;
            console.error('Signup error:', message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Updates the user state and persists it.
     * @param {Object} updatedUser The new user object to store
     */
    const updateUser = async (updatedUser) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error('Failed to update user', error);
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    const deleteAccount = async () => {
        if (!user?.email) throw new Error('No user to delete');
        setLoading(true);
        try {
            const response = await fetchWithRetry(`${API_URL}/users/${encodeURIComponent(user.email)}`, {
                method: 'DELETE',
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || data.success === false) {
                throw new Error(data.error || data.message || 'Failed to delete account');
            }
            await logout();
            return true;
        } catch (error) {
            const message = error.name === 'AbortError' ? 'Server timeout. Please try again.' : error.message;
            console.error('Delete account error:', message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, isInitializing, login, signup, logout, updateUser, deleteAccount }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
