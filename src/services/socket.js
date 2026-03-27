import { io } from 'socket.io-client';

import { API_URL } from '../config';



const SOCKET_URL = API_URL.replace('/api', '');

console.log('[Socket] Initialized with URL:', SOCKET_URL);

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

export const joinGarage = (garageId) => {
    socket.emit('join_garage', garageId);
};


export const updateMechanicLocation = (orderId, coords) => {
    socket.emit('update_location', { orderId, location: coords });
};

export const onLocationUpdate = (callback) => {
    socket.off('location_updated'); 
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

export const onNewOrder = (callback) => {
    socket.off('new_order');
    socket.on('new_order', callback);
};

export const offNewOrder = () => {
    socket.off('new_order');
};

export default socket;
