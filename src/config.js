import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Centrally manages the API URL calculation for development and production.
 * Detects the host IP for Expo Go compatibility.
 */
export const getApiUrl = () => {
    // 1. Check for hostUri (standard for Expo Go during development)
    const hostUri = Constants.expoConfig?.hostUri || '';
    let host = hostUri.split(':')[0];

    // 2. Fallbacks for specific environments
    if (!host) {
        if (Platform.OS === 'android') {
            host = '10.0.2.2'; // Standard Android Emulator loopback
        } else {
            host = '127.0.0.1'; // iOS Simulator or Web
        }
    }

    // 3. Construct the final URL
    // Toggle this manually (true for Render, false for local dev)
    const isProd = true;

    if (isProd) {
        return 'https://help-my-car.onrender.com/api';
    }

    // Default local behavior (using port 5002 as per user's backend setup)
    return `http://${host}:5002/api`;
};

export const API_URL = getApiUrl();

console.log('[Config] Initialized API_URL:', API_URL);

if (API_URL.includes('127.0.0.1') && Platform.OS === 'android') {
    console.warn('[Config] WARNING: Using 127.0.0.1 on Android will not reach the local backend. Ensure you are using the correct host IP.');
}
