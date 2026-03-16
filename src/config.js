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
    if (!host || host.includes('192.168')) {
        if (Platform.OS === 'android') {
            host = '10.0.2.2'; // Standard Android Emulator loopback
        } else {
            host = '127.0.0.1'; // iOS Simulator or Web
        }
    }

    // 3. Construct the final URL
    // Automatically use production URL only in production builds
    const isProd = !__DEV__;

    if (isProd) {
        return 'https://help-my-car.onrender.com/api';
    }

    // Default local behavior (using port 5002 as per user's backend setup)
    return `http://${host}:5002/api`;
};

export const API_URL = getApiUrl();

// Google Auth Configuration
// IMPORTANT: Replace these with real Client IDs from Google Cloud Console (APIs & Services > Credentials)
// Web Client ID is required for Expo Go and Web. 
// Android/iOS Client IDs are required for standalone/native builds.
export const GOOGLE_CONFIG = {
    // 1. Get this from Google Cloud Console > Credentials > OAuth 2.0 Client IDs > Web client (Auto-created for Google Sign-in)
    webClientId: '150268904855-emtk9pquv2orls9t755m06b90o6svm0c.apps.googleusercontent.com', 
    
    // 2. Add these if you plan to build standalone APK/IPA or use development builds
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    
    firebase: {
        apiKey: "AIzaSyCIfmlZh8244pZi7rPI2MZsSp30KvtgSVY",
        authDomain: "helpmycar-7362b.firebaseapp.com",
        projectId: "helpmycar-7362b",
        storageBucket: "helpmycar-7362b.firebasestorage.app",
        messagingSenderId: "150268904855",
        appId: "1:150268904855:web:87c4934d560e4edc1df0d2",
        measurementId: "G-4W8YXDZBNT"
    }
};

console.log('[Config] Initialized API_URL:', API_URL);

if (API_URL.includes('127.0.0.1') && Platform.OS === 'android') {
    console.warn('[Config] WARNING: Using 127.0.0.1 on Android will not reach the local backend. Ensure you are using the correct host IP.');
}
