import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { io } from 'socket.io-client';

// ── Dynamic URL — works on emulator AND physical device ──────────────────────
const getSocketUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri || '';
    let host = debuggerHost.split(':')[0];
    if (!host) {
        host = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
    }
    return `http://${host}:5002`;
};

const SOCKET_URL = getSocketUrl();

const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export const connectSocket = () => {
    if (!socket.connected) socket.connect();
};

export const disconnectSocket = () => {
    if (socket.connected) socket.disconnect();
};

export const joinOrder = (orderId) => {
    socket.emit('join_order', orderId);
};

// Called by mechanic side: stream GPS to users tracking this order
export const updateMechanicLocation = (orderId, coords) => {
    socket.emit('update_location', { orderId, location: coords });
};

export const onLocationUpdate = (callback) => {
    socket.off('location_updated'); // prevent duplicate listeners
    socket.on('location_updated', callback);
};

export const offLocationUpdate = () => {
    socket.off('location_updated');
};

export const onOrderStatusUpdate = (callback) => {
    socket.off('order_updated');
    socket.on('order_updated', callback);
};

export const offOrderStatusUpdate = () => {
    socket.off('order_updated');
};

export default socket;
