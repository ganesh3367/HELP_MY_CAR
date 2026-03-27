import Constants from 'expo-constants';
import { Platform } from 'react-native';


export const getApiUrl = () => {
    
    const hostUri = Constants.expoConfig?.hostUri || '';
    let host = hostUri.split(':')[0];

    
    if (!host || host.includes('192.168')) {
        if (Platform.OS === 'android') {
            host = '10.0.2.2'; 
        } else {
            host = '127.0.0.1'; 
        }
    }

    
    
    const isProd = true;

    if (isProd) {
        return 'https://help-my-car.onrender.com/api';
    }

    
    return `http://${host}:5002/api`;
};

export const API_URL = getApiUrl();



export const GOOGLE_CONFIG = {
    webClientId: '150268904855-87c4934d560e4edc1df0d2.apps.googleusercontent.com', 
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
