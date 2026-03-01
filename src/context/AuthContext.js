/**
 * AuthContext.js
 * Manages user authentication state including login, signup, and logout/
 * Persists user state using AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

// Use your machine's IP (e.g., 192.168.x.x) if testing on physical device.
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api';

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
    const signup = async (name, email, password) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/users/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
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
