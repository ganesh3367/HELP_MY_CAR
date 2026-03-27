import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import {
    CheckCircle,
    Clock,
    MapPin,
    Navigation,
    Phone,
    User,
    Wrench,
    X
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import socket, { connectSocket, joinOrder } from '../services/socket';

const { width, height } = Dimensions.get('window');

const ORDER_STEPS = [
    { key: 'PENDING', label: 'Request', icon: Clock },
    { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle },
    { key: 'ON_THE_WAY', label: 'On Way', icon: MapPin },
    { key: 'ARRIVED', label: 'Arrived', icon: Wrench },
    { key: 'IN_PROGRESS', label: 'Working', icon: Wrench },
    { key: 'COMPLETED', label: 'Done', icon: CheckCircle },
];

const stepIndex = (status) => ORDER_STEPS.findIndex(s => s.key === status);

const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const etaMinutes = (dist) => Math.max(1, Math.round(dist * 3));

const PulseDot = ({ color }) => {
    const scale = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scale, { toValue: 1.5, duration: 700, useNativeDriver: true }),
                Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
            ])
        ).start();
    }, [scale]);
    return (
        <Animated.View style={[styles.pulseDot, { backgroundColor: color, transform: [{ scale }] }]} />
    );
};

const GarageOrderTrackingScreen = () => {
    const navigation = useNavigation();
    const { params } = useRoute();
    const { updateOrderStatus } = useAppContext();
    const [order, setOrder] = useState(params?.order);
    const [loading, setLoading] = useState(false);
    const [locationPath, setLocationPath] = useState([]);
    const [mechanicCoords, setMechanicCoords] = useState(null);
    const mapRef = useRef(null);
    const locationSubscription = useRef(null);
    const slideAnim = useRef(new Animated.Value(height * 0.4)).current;

    const userLat = order?.userLocation?.lat;
    const userLng = order?.userLocation?.lng;
    const mechLat = mechanicCoords?.lat || order?.mechanicLocation?.lat || 18.5204;
    const mechLng = mechanicCoords?.lng || order?.mechanicLocation?.lng || 73.8567;

    const distKm = userLat && mechLat ? haversine(userLat, userLng, mechLat, mechLng) : null;
    const eta = distKm ? etaMinutes(distKm) : null;

    useEffect(() => {
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();

        if (order?.id || order?._id) {
            connectSocket();
            joinOrder(order.id || order._id);
        }

        if (order?.status === 'ON_THE_WAY') {
            startLocationTracking();
        }

        return () => stopLocationTracking();
    }, []);

    const panMapToBoth = useCallback((mCoords) => {
        if (!mapRef.current || !userLat) return;
        const midLat = (userLat + mCoords.lat) / 2;
        const midLng = (userLng + mCoords.lng) / 2;
        const delta = Math.max(Math.abs(userLat - mCoords.lat), Math.abs(userLng - mCoords.lng)) * 2.5 + 0.01;
        mapRef.current.animateToRegion({
            latitude: midLat,
            longitude: midLng,
            latitudeDelta: delta,
            longitudeDelta: delta
        }, 800);
    }, [userLat]);

    const startLocationTracking = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            locationSubscription.current = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 5000 },
                (location) => {
                    const coords = { lat: location.coords.latitude, lng: location.coords.longitude };
                    setMechanicCoords(coords);
                    setLocationPath(prev => [...prev, { latitude: coords.lat, longitude: coords.lng }]);
                    socket.emit('update_location', { orderId: order.id || order._id, location: coords });
                    panMapToBoth(coords);
                }
            );
        } catch (error) {
            console.error('Tracking Error:', error);
        }
    };

    const stopLocationTracking = () => {
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setLoading(true);
        const success = await updateOrderStatus(order.id || order._id, newStatus);
        setLoading(false);

        if (success) {
            setOrder(prev => ({ ...prev, status: newStatus }));
            if (newStatus === 'ON_THE_WAY') startLocationTracking();
            else if (newStatus === 'ARRIVED' || newStatus === 'COMPLETED') stopLocationTracking();

            if (newStatus === 'COMPLETED') {
                Alert.alert('Success', 'Order completed!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
            }
        }
    };

    const getNextAction = () => {
        const s = order.status;
        if (s === 'ACCEPTED') return { label: 'Mark On The Way', status: 'ON_THE_WAY', color: '#5856D6', icon: Navigation };
        if (s === 'ON_THE_WAY') return { label: 'Mark Arrived', status: 'ARRIVED', color: COLORS.success, icon: MapPin };
        if (s === 'ARRIVED') return { label: 'Start Working', status: 'IN_PROGRESS', color: COLORS.primary, icon: Wrench };
        if (s === 'IN_PROGRESS') return { label: 'Complete Job', status: 'COMPLETED', color: COLORS.success, icon: CheckCircle };
        return null;
    };

    const action = getNextAction();
    const currentStep = stepIndex(order.status);
    const statusColor = {
        PENDING: '#FF9500', ACCEPTED: '#007AFF', ON_THE_WAY: '#34C759',
        ARRIVED: '#5856D6', IN_PROGRESS: '#FF8C00', COMPLETED: '#8E8E93'
    }[order.status] || COLORS.primary;

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{ latitude: userLat, longitude: userLng, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
            >
                <Marker coordinate={{ latitude: userLat, longitude: userLng }} title="Customer">
                    <View style={styles.userMarker}><User size={18} color={COLORS.white} /></View>
                </Marker>
                <Marker coordinate={{ latitude: mechLat, longitude: mechLng }} title="You">
                    <View style={styles.garageMarker}><Wrench size={18} color={COLORS.white} /></View>
                </Marker>
                {}
                {userLat && userLng && mechLat && mechLng && ['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(order.status) && (
                    <Polyline
                        coordinates={[
                            { latitude: userLat, longitude: userLng },
                            { latitude: mechLat, longitude: mechLng }
                        ]}
                        strokeColor={COLORS.primary}
                        strokeWidth={5}
                        lineCap="round"
                        lineJoin="round"
                    />
                )}
                {locationPath.length > 1 && (
                    <Polyline coordinates={locationPath} strokeColor={COLORS.primary} strokeWidth={4} lineDashPattern={[5, 2]} />
                )}
            </MapView>

            <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
                <View style={styles.topRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><X size={20} color={COLORS.text} /></TouchableOpacity>
                    <View style={[styles.statusChip, { backgroundColor: COLORS.white, borderColor: statusColor + '40' }]}>
                        <PulseDot color={statusColor} />
                        <Text style={[styles.statusChipText, { color: statusColor }]}>{order.status}</Text>
                    </View>
                    {eta && (
                        <View style={styles.etaChip}>
                            <Text style={styles.etaNumber}>{eta}</Text>
                            <Text style={styles.etaUnit}>min</Text>
                        </View>
                    )}
                </View>
            </SafeAreaView>

            <Animated.View style={[styles.bottomCard, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.handle} />
                <View style={styles.orderHeader}>
                    <Text style={styles.vehicleName}>{order.vehicleDetails.make} {order.vehicleDetails.model}</Text>
                    <Text style={styles.issueText}>{order.vehicleDetails.issue}</Text>
                </View>

                {}
                <View style={styles.timeline}>
                    {ORDER_STEPS.slice(1, 6).map((step, i) => {
                        const done = i + 1 <= currentStep;
                        const Icon = step.icon;
                        return (
                            <View key={step.key} style={styles.timelineItem}>
                                {i < 4 && <View style={[styles.timelineConnector, done && i + 1 < currentStep && { backgroundColor: COLORS.primary }]} />}
                                <View style={[styles.timelineDot, done && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
                                    {done ? <Icon size={8} color={COLORS.white} /> : null}
                                </View>
                                <Text style={[styles.timelineLabel, done && { color: COLORS.text, fontWeight: '700' }]}>{step.label}</Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.customerCard}>
                    <View style={styles.customerInfo}>
                        <View style={styles.avatar}><User size={22} color={COLORS.primary} /></View>
                        <View>
                            <Text style={styles.customerName}>Customer</Text>
                            <Text style={styles.customerSub}>{distKm ? `${distKm.toFixed(1)} km away` : 'Active Request'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.callButton} onPress={() => Linking.openURL('tel:+911234567890')}><Phone size={20} color={COLORS.white} /></TouchableOpacity>
                </View>

                {action && (
                    <TouchableOpacity style={[styles.mainAction, { backgroundColor: action.color }]} onPress={() => handleStatusUpdate(action.status)} disabled={loading}>
                        <Text style={styles.mainActionText}>{action.label}</Text>
                        <Navigation size={20} color={COLORS.white} />
                    </TouchableOpacity>
                )}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    map: { flex: 1 },
    topOverlay: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: SPACING.md, paddingTop: Platform.OS === 'ios' ? 12 : 30, zIndex: 20 },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium },
    statusChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24, borderWidth: 1, backgroundColor: COLORS.white, ...SHADOWS.medium },
    statusChipText: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
    etaChip: { backgroundColor: COLORS.primary, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', ...SHADOWS.medium },
    etaNumber: { fontSize: 18, fontWeight: '900', color: COLORS.white },
    etaUnit: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
    pulseDot: { width: 8, height: 8, borderRadius: 4 },
    userMarker: { padding: 6, backgroundColor: COLORS.error, borderRadius: 15, borderWidth: 2, borderColor: COLORS.white, ...SHADOWS.small },
    garageMarker: { padding: 6, backgroundColor: COLORS.primary, borderRadius: 15, borderWidth: 2, borderColor: COLORS.white, ...SHADOWS.small },
    bottomCard: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: SPACING.lg, paddingBottom: Platform.OS === 'ios' ? 40 : 25, ...SHADOWS.large },
    handle: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
    orderHeader: { marginBottom: 15 },
    vehicleName: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
    issueText: { fontSize: 14, color: COLORS.textLight },
    timeline: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 5 },
    timelineItem: { alignItems: 'center', flex: 1, position: 'relative' },
    timelineConnector: { position: 'absolute', top: 10, left: '50%', right: '-50%', height: 2, backgroundColor: '#E0E0E0' },
    timelineDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#E0E0E0', borderWidth: 2, borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', marginBottom: 4, zIndex: 1 },
    timelineLabel: { fontSize: 8, color: COLORS.textLight, textAlign: 'center' },
    customerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: 14, borderRadius: 16, marginBottom: 20 },
    customerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary + '10', alignItems: 'center', justifyContent: 'center' },
    customerName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
    customerSub: { fontSize: 11, color: COLORS.textLight },
    callButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    mainAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, ...SHADOWS.medium },
    mainActionText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});

export default GarageOrderTrackingScreen;
