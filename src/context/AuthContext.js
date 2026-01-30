/**
 * AuthContext.js
 * Manages user authentication state including login, signup, and logout/
 * Persists user state using AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
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
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data
     */
    const login = async (email, password) => {
        setLoading(true);
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                if (email && password) {
                    const userData = { email, name: email.split('@')[0], id: '123' };
                    await AsyncStorage.setItem('user', JSON.stringify(userData));
                    setUser(userData);
                    setLoading(false);
                    resolve(userData);
                } else {
                    setLoading(false);
                    reject('Invalid credentials');
                }
            }, 1500);
        });
    };

    const signup = async (name, email, password) => {
        setLoading(true);
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                if (name && email && password) {
                    const userData = { name, email, id: '123' };
                    await AsyncStorage.setItem('user', JSON.stringify(userData));
                    setUser(userData);
                    setLoading(false);
                    resolve(userData);
                } else {
                    setLoading(false);
                    reject('Please fill all fields');
                }
            }, 1500);
        });
    };

    const logout = async () => {
        await AsyncStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
