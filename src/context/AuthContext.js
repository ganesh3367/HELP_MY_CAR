/**
 * AuthContext.js
 * Manages user authentication state including login, signup, and logout/
 * Persists user state using AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

import { API_URL } from '../config';
import { fetchWithRetry } from '../services/api';

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

            const data = await response.json();

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

            const response = await fetchWithRetry(`${API_URL}/users/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload),
            });

            const data = await response.json();

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

    return (
        <AuthContext.Provider value={{ user, token, loading, isInitializing, login, signup, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
