import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import {
    CheckCircle,
    Clock,
    MapPin,
    Phone,
    Wrench,
    X,
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
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import RatingModal from '../components/RatingModal';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import {
    connectSocket,
    disconnectSocket,
    joinOrder,
    offLocationUpdate,
    offOrderStatusUpdate,
    onLocationUpdate,
    onOrderStatusUpdate,
} from '../services/socket';

const { width, height } = Dimensions.get('window');

// ── Step config (Zomato/Uber-style order progress) ───────────────────────────
const ORDER_STEPS = [
    { key: 'PENDING', label: 'Request Sent', icon: Clock },
    { key: 'ACCEPTED', label: 'Mechanic Assigned', icon: CheckCircle },
    { key: 'ON_THE_WAY', label: 'On the Way', icon: MapPin },
    { key: 'ARRIVED', label: 'Arrived', icon: Wrench },
    { key: 'IN_PROGRESS', label: 'Working on Car', icon: Wrench },
    { key: 'COMPLETED', label: 'Done!', icon: CheckCircle },
];

const stepIndex = (status) => ORDER_STEPS.findIndex(s => s.key === status);

// ── Haversine ─────────────────────────────────────────────────────────────────
const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const etaMinutes = (dist) => Math.max(1, Math.round(dist * 3)); // ~3 min/km city

// ── Pulse dot for "live" indicator ───────────────────────────────────────────
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

// ── Car / Mechanic animated marker ───────────────────────────────────────────
const MechanicMarker = ({ status }) => {
    const bounce = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (status === 'ON_THE_WAY') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bounce, { toValue: -6, duration: 400, useNativeDriver: true }),
                    Animated.timing(bounce, { toValue: 0, duration: 400, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [status, bounce]);
    return (
        <Animated.View style={[styles.mechanicMarker, { transform: [{ translateY: bounce }] }]}>
            <Text style={{ fontSize: 24 }}>🔧</Text>
        </Animated.View>
    );
};

// ── OrderTrackingScreen ───────────────────────────────────────────────────────
const OrderTrackingScreen = () => {
    const navigation = useNavigation();
    const { params } = useRoute();
    const { trackOrderStatus } = useAppContext();

    const [order, setOrder] = useState(params?.order || null);
    const [mechanicCoords, setMechanicCoords] = useState(
        order?.mechanicLocation ? { lat: order.mechanicLocation.lat, lng: order.mechanicLocation.lng } : null
    );
    const [locationPath, setLocationPath] = useState([]); // breadcrumb trail
    const [isRatingVisible, setIsRatingVisible] = useState(false);
    const mapRef = useRef(null);
    const slideAnim = useRef(new Animated.Value(300)).current;

    // ── Slide up bottom card on mount ─────────────────────────────────────
    useEffect(() => {
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
    }, [slideAnim]);

    // ── Poll + socket ─────────────────────────────────────────────────────
    useEffect(() => {
        const orderId = order?.id || order?._id;
        if (!orderId) return;

        // Initial fetch
        const fetchOnce = async () => {
            const updated = await trackOrderStatus(orderId);
            if (updated) {
                setOrder(updated);
                // Also update mechanic coords if available
                if (updated.mechanicLocation) {
                    setMechanicCoords({ lat: updated.mechanicLocation.lat, lng: updated.mechanicLocation.lng });
                }
            }
        };
        fetchOnce();

        // Socket setup
        connectSocket();
        joinOrder(orderId);

        onLocationUpdate((newCoords) => {
            setMechanicCoords(newCoords);
            setLocationPath(prev => [...prev.slice(-50), { latitude: newCoords.lat, longitude: newCoords.lng }]);
            panMapToBoth(newCoords);
        });

        onOrderStatusUpdate((updated) => {
            setOrder(prev => ({ ...prev, ...updated }));
            if (updated.status === 'ARRIVED') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        });

        return () => {
            offLocationUpdate();
            offOrderStatusUpdate();
            disconnectSocket();
        };
    }, [order?.id, order?._id]);

    // ── Pan map to show both user + mechanic ──────────────────────────────
    const panMapToBoth = useCallback((mechCoords) => {
        if (!mapRef.current || !order?.userLocation) return;
        const uLat = order.userLocation.lat;
        const uLng = order.userLocation.lng;
        const mLat = mechCoords?.lat;
        const mLng = mechCoords?.lng;
        if (!mLat || !mLng) return;
        const midLat = (uLat + mLat) / 2;
        const midLng = (uLng + mLng) / 2;
        const delta = Math.max(Math.abs(uLat - mLat), Math.abs(uLng - mLng)) * 2.2 + 0.01;
        mapRef.current.animateToRegion({ latitude: midLat, longitude: midLng, latitudeDelta: delta, longitudeDelta: delta }, 500);
    }, [order?.userLocation]);

    const status = order?.status || 'PENDING';
    const currentStep = stepIndex(status);
    const isOnWay = status === 'ON_THE_WAY';
    const isArrived = status === 'ARRIVED' || status === 'IN_PROGRESS';
    const isDone = status === 'COMPLETED';

    const userLat = order?.userLocation?.lat;
    const userLng = order?.userLocation?.lng;
    const mechLat = mechanicCoords?.lat;
    const mechLng = mechanicCoords?.lng;
    const hasUserLoc = userLat && userLng;
    const hasMechLoc = mechLat && mechLng;

    const distKm = hasUserLoc && hasMechLoc ? haversine(userLat, userLng, mechLat, mechLng) : null;
    const eta = distKm ? etaMinutes(distKm) : null;

    // ── Status chip style ─────────────────────────────────────────────────
    const statusColor = {
        PENDING: '#FF9500',
        ACCEPTED: '#007AFF',
        ON_THE_WAY: '#34C759',
        ARRIVED: '#5856D6',
        IN_PROGRESS: '#FF8C00',
        COMPLETED: '#8E8E93',
    }[status] || COLORS.primary;

    const statusLabel = {
        PENDING: '🔍 Finding a mechanic…',
        ACCEPTED: '✅ Mechanic Assigned!',
        ON_THE_WAY: '🏍 Mechanic is on the way',
        ARRIVED: '📍 Mechanic has arrived!',
        IN_PROGRESS: '🔧 Working on your car',
        COMPLETED: '✅ Service Complete!',
    }[status] || status;

    const initialRegion = hasUserLoc
        ? { latitude: userLat, longitude: userLng, latitudeDelta: 0.025, longitudeDelta: 0.025 }
        : { latitude: 18.5204, longitude: 73.8567, latitudeDelta: 0.05, longitudeDelta: 0.05 };

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <PulseDot color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading order…</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            {/* ── FULL SCREEN MAP ────────────────────────────────── */}
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                initialRegion={initialRegion}
                showsCompass={false}
                showsMyLocationButton={false}
                pitchEnabled={false}
            >
                {/* User dot */}
                {hasUserLoc && (
                    <Marker
                        coordinate={{ latitude: userLat, longitude: userLng }}
                        anchor={{ x: 0.5, y: 0.5 }}
                        tracksViewChanges={false}
                    >
                        <View style={styles.userDotOuter}>
                            <View style={styles.userDotInner} />
                        </View>
                    </Marker>
                )}

                {/* Mechanic animated car marker */}
                {hasMechLoc && (
                    <Marker
                        coordinate={{ latitude: mechLat, longitude: mechLng }}
                        anchor={{ x: 0.5, y: 0.5 }}
                        tracksViewChanges
                    >
                        <MechanicMarker status={status} />
                    </Marker>
                )}

                {/* Breadcrumb route trail */}
                {locationPath.length > 1 && (
                    <Polyline
                        coordinates={locationPath}
                        strokeColor={COLORS.primary}
                        strokeWidth={3}
                        lineDashPattern={[8, 4]}
                    />
                )}
            </MapView>

            {/* ── TOP STATUS CHIP ────────────────────────────────── */}
            <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
                <View style={styles.topRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <X size={20} color={COLORS.text} />
                    </TouchableOpacity>
                    <View style={[styles.statusChip, { backgroundColor: statusColor + '20', borderColor: statusColor + '40' }]}>
                        <PulseDot color={statusColor} />
                        <Text style={[styles.statusChipText, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                    {eta && (
                        <View style={styles.etaChip}>
                            <Text style={styles.etaNumber}>{eta}</Text>
                            <Text style={styles.etaUnit}>min</Text>
                        </View>
                    )}
                </View>
            </SafeAreaView>

            {/* ── BOTTOM SLIDE-UP CARD ────────────────────────────── */}
            <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
                {/* Handle */}
                <View style={styles.handle} />

                {/* Mechanic info row */}
                <View style={styles.mechanicRow}>
                    <View style={styles.avatarCircle}>
                        <Text style={{ fontSize: 28 }}>🧑‍🔧</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={styles.mechanicLabel}>Your Mechanic</Text>
                        <Text style={styles.mechanicName}>
                            {order.garageName || order.mechanic?.name || 'Assigned Mechanic'}
                        </Text>
                        <View style={styles.ratingRow}>
                            <Text style={styles.stars}>★ {order.mechanic?.rating || '4.8'}</Text>
                            <Text style={styles.bullet}> • </Text>
                            <Text style={styles.subText}>
                                {order.vehicleDetails?.make} {order.vehicleDetails?.model}
                            </Text>
                        </View>
                    </View>
                    {/* Call button */}
                    <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => Linking.openURL(`tel:${order.mechanic?.phone || '+911234567890'}`)}
                    >
                        <Phone size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                {/* ── Status timeline (Zomato-style) ───────────────── */}
                <View style={styles.timeline}>
                    {ORDER_STEPS.slice(0, 5).map((step, i) => {
                        const done = i <= currentStep;
                        const active = i === currentStep;
                        const Icon = step.icon;
                        return (
                            <View key={step.key} style={styles.timelineItem}>
                                {/* Connector line */}
                                {i < ORDER_STEPS.length - 2 && (
                                    <View style={[styles.timelineConnector, done && i < currentStep && { backgroundColor: COLORS.primary }]} />
                                )}
                                {/* Dot */}
                                <View style={[styles.timelineDot, done && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
                                    {done ? <Icon size={10} color={COLORS.white} /> : null}
                                </View>
                                {/* Label */}
                                <Text style={[styles.timelineLabel, done && { color: COLORS.text, fontWeight: '700' }]}>
                                    {step.label}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* ── Live location info ───────────────────────────── */}
                {distKm && isOnWay && (
                    <View style={styles.liveInfoRow}>
                        <PulseDot color="#34C759" />
                        <Text style={styles.liveText}>
                            Mechanic is <Text style={styles.liveHighlight}>{distKm.toFixed(1)} km</Text> away — arrives in ~<Text style={styles.liveHighlight}>{eta} min</Text>
                        </Text>
                    </View>
                )}

                {isArrived && !isDone && (
                    <View style={[styles.liveInfoRow, { backgroundColor: '#F0FFF4' }]}>
                        <Text style={{ fontSize: 20 }}>📍</Text>
                        <Text style={[styles.liveText, { color: '#1a8a3c' }]}>Mechanic has arrived at your location!</Text>
                    </View>
                )}

                {/* ── Action buttons ───────────────────────────────── */}
                {isDone ? (
                    <TouchableOpacity style={styles.rateBtn} onPress={() => setIsRatingVisible(true)}>
                        <Text style={styles.rateBtnText}>⭐ Rate your experience</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.issueRow}>
                        <MapPin size={14} color={COLORS.textLight} />
                        <Text style={styles.issueText} numberOfLines={2}>
                            {order.vehicleDetails?.issue || 'General service request'}
                        </Text>
                    </View>
                )}
            </Animated.View>

            <RatingModal
                visible={isRatingVisible}
                onClose={() => setIsRatingVisible(false)}
                onSave={(data) => {
                    Alert.alert('Thank you!', 'Your feedback helps us improve.');
                    navigation.navigate('Home');
                }}
                mechanicName={order.garageName || 'Mechanic'}
            />
        </View>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const CARD_HEIGHT = height * 0.44;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#EEF2F8' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    loadingText: { fontSize: 16, color: COLORS.textLight, fontWeight: '600' },

    // ─ Map markers ───────────────────────────────────────────────────────────
    userDotOuter: {
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: 'rgba(0,122,255,0.25)', alignItems: 'center', justifyContent: 'center',
        borderWidth: 2.5, borderColor: '#007AFF',
    },
    userDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF' },
    mechanicMarker: {
        backgroundColor: COLORS.white, borderRadius: 24,
        padding: 8, ...SHADOWS.large,
        borderWidth: 2, borderColor: COLORS.primary,
    },

    // ─ Top overlay ───────────────────────────────────────────────────────────
    topOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0,
        paddingHorizontal: SPACING.md,
        paddingTop: Platform.OS === 'ios' ? 12 : 30,
        zIndex: 20,
    },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium,
    },
    statusChip: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24,
        borderWidth: 1, backgroundColor: COLORS.white, ...SHADOWS.medium,
    },
    statusChipText: { fontSize: 13, fontWeight: '700', flexShrink: 1 },
    etaChip: {
        backgroundColor: COLORS.primary, borderRadius: 16,
        paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center',
        ...SHADOWS.medium,
    },
    etaNumber: { fontSize: 18, fontWeight: '900', color: COLORS.white },
    etaUnit: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },

    // ─ Pulse dot ─────────────────────────────────────────────────────────────
    pulseDot: { width: 8, height: 8, borderRadius: 4 },

    // ─ Bottom card ───────────────────────────────────────────────────────────
    card: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        paddingHorizontal: SPACING.lg, paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        paddingTop: 14, ...SHADOWS.large,
        minHeight: CARD_HEIGHT,
    },
    handle: {
        width: 44, height: 4, borderRadius: 2, backgroundColor: '#DDDDE3',
        alignSelf: 'center', marginBottom: 20,
    },

    // ─ Mechanic row ──────────────────────────────────────────────────────────
    mechanicRow: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 20,
        backgroundColor: '#F7F8FA', borderRadius: 20, padding: 12,
    },
    avatarCircle: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: COLORS.primary + '30',
    },
    mechanicLabel: { fontSize: 11, color: COLORS.textLight, fontWeight: '600' },
    mechanicName: { fontSize: 17, fontWeight: '800', color: COLORS.text },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    stars: { fontSize: 13, color: '#B8860B', fontWeight: '700' },
    bullet: { color: COLORS.textLight },
    subText: { fontSize: 12, color: COLORS.textLight },
    callBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.small,
    },

    // ─ Timeline ──────────────────────────────────────────────────────────────
    timeline: {
        flexDirection: 'row', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 18,
    },
    timelineItem: { alignItems: 'center', flex: 1, position: 'relative' },
    timelineConnector: {
        position: 'absolute', top: 12, left: '50%', right: '-50%',
        height: 2, backgroundColor: '#E0E0E0', zIndex: 0,
    },
    timelineDot: {
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: '#E0E0E0', borderWidth: 2, borderColor: '#E0E0E0',
        alignItems: 'center', justifyContent: 'center', marginBottom: 6, zIndex: 1,
    },
    timelineLabel: {
        fontSize: 9, color: COLORS.textLight, fontWeight: '600',
        textAlign: 'center',
    },

    // ─ Live info ─────────────────────────────────────────────────────────────
    liveInfoRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#F0FFF7', borderRadius: 14, padding: 12, marginBottom: 14,
        borderWidth: 1, borderColor: '#B7EBD5',
    },
    liveText: { fontSize: 13, color: COLORS.text, fontWeight: '500', flex: 1 },
    liveHighlight: { fontWeight: '800', color: '#1a8a3c' },

    // ─ Issue / Rate ──────────────────────────────────────────────────────────
    issueRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#F7F8FA', borderRadius: 12, padding: 12,
    },
    issueText: { flex: 1, fontSize: 13, color: COLORS.textLight, fontWeight: '500' },
    rateBtn: {
        backgroundColor: '#FFF8E1', borderRadius: 16, padding: 16,
        alignItems: 'center', borderWidth: 1, borderColor: '#FFD700',
    },
    rateBtnText: { fontSize: 16, fontWeight: '800', color: '#B8860B' },
});

export default OrderTrackingScreen;
