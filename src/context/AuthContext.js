/**
 * AuthContext.js
 * Manages user authentication state including login, signup, and logout/
 * Persists user state using AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

// Get the host IP dynamically for physical devices and emulators
const getApiUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri || '';
    let host = debuggerHost.split(':')[0];

    if (!host) {
        // Fallback for emulators/simulators when not connected to a debugger
        host = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
    }

    // If it's a tunnel URL, it likely won't work for a local backend on port 5002
    // without a separate tunnel. We warn about this in logs.
    if (host.includes('exp.direct')) {
        console.warn('[AuthContext] WARNING: You are using an Expo Tunnel. Local API on port 5002 may not be reachable without a separate tunnel.');
    }

    const url = `http://${host}:5002/api`;
    return url;
};

const API_URL = getApiUrl();

console.log('[AuthContext] Calculated API_URL:', API_URL);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

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
                setLoading(false);
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
            const response = await fetch(`${API_URL}/users/login`, {
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
            console.error('Login error:', error);
            throw error;
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
            const bodyPayload = { name, email, password, role };
            if (role === 'garage' && garageDetails) {
                // Merge garage details if role is garage
                Object.assign(bodyPayload, garageDetails);
            }

            const response = await fetch(`${API_URL}/users/signup`, {
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
            console.error('Signup error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
