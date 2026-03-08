import { useRoute } from '@react-navigation/native';
import { Clock, MapPin, Navigation, Navigation2, RefreshCw, ShieldCheck, Star, Wrench } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { useLocation } from '../context/LocationContext';

// Replace this with your own key from console.cloud.google.com
const GOOGLE_MAPS_API_KEY = 'AIzaSyA3oFvnPMBJWcPLvqSHHvLcMfgbxLNq7oo';

// ─── Haversine (km) ───────────────────────────────────────────────────────────
const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.52;

import { API_URL } from '../config';

const MechanicMarker = ({ selected }) => (
    <View style={[styles.marker, selected && styles.markerSelected]}>
        <Wrench size={16} color={selected ? COLORS.white : COLORS.primary} />
    </View>
);

const UserMarker = () => (
    <View style={styles.userDotOuter}>
        <View style={styles.userDotInner} />
    </View>
);

const MechanicCard = ({ item, index, isSelected, onSelect, navigation }) => {
    const etaMin = item.distance != null ? Math.ceil(item.distance * 3) : null;
    const isElite = (item.rating || 0) >= 4.5;
    const experience = item.yearsOfExperience || (isElite ? 10 + (index % 5) : 3 + (index % 7));

    const translateY = useRef(new Animated.Value(50)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                friction: 8,
                delay: index * 100
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
                delay: index * 100
            })
        ]).start();
    }, [index, opacity, translateY]);

    return (
        <Animated.View style={{ transform: [{ translateY }], opacity }}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onSelect}
                style={[styles.card, isSelected && styles.cardSelected]}
            >
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                                {isElite && (
                                    <View style={styles.eliteBadge}>
                                        <ShieldCheck size={12} color="#D4AF37" />
                                        <Text style={styles.eliteText}>Elite</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.addressRow}>
                                <MapPin size={12} color={COLORS.textLight} />
                                <Text style={styles.cardAddress} numberOfLines={1}>{item.address}</Text>
                            </View>
                        </View>
                        <View style={styles.ratingRow}>
                            <Star size={14} color="#FFB800" fill="#FFB800" />
                            <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '—'}</Text>
                        </View>
                    </View>

                    <View style={styles.trustRow}>
                        <View style={styles.experienceTag}>
                            <Text style={styles.experienceText}>{experience}+ Years EXP</Text>
                        </View>
                        <View style={styles.specialtyTag}>
                            <Text style={styles.specialtyText}>
                                {item.specialties?.[0] || 'Car Specialist'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <Clock size={14} color={COLORS.primary} />
                            <Text style={styles.statText}>{etaMin ? `${etaMin} min` : '5 min'}</Text>
                        </View>
                        <View style={styles.statDot} />
                        <View style={styles.statItem}>
                            <MapPin size={14} color={COLORS.primary} />
                            <Text style={styles.statText}>{item.distance != null ? `${item.distance.toFixed(1)} km` : 'Near'}</Text>
                        </View>
                        {item.openNow !== undefined && (
                            <>
                                <View style={styles.statDot} />
                                <Text style={[styles.statusText, { color: item.openNow ? '#27ae60' : '#e74c3c' }]}>
                                    {item.openNow ? 'Open Now' : 'Closed'}
                                </Text>
                            </>
                        )}
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.navBtn}
                            onPress={() => {
                                const lat = item.lat || item.location?.lat;
                                const lng = item.lng || item.location?.lng;
                                const url = Platform.select({
                                    ios: `maps://app?daddr=${lat},${lng}`,
                                    android: `google.navigation:q=${lat},${lng}`
                                });
                                require('react-native').Linking.openURL(url);
                            }}
                        >
                            <Navigation size={18} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.bookBtn}
                            onPress={() => navigation.navigate('MechanicProfile', { mechanic: item })}
                        >
                            <Text style={styles.bookBtnText}>Book Mechanic</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const EtaBadge = ({ minutes }) => (
    <View style={styles.etaBadge}>
        <Text style={styles.etaText}>{minutes ? `${minutes} min` : '~5 min'}</Text>
    </View>
);

const NearbyMechanicsScreen = ({ navigation }) => {
    const { params } = useRoute();
    const { location, loading: locationLoading, requestLocation } = useLocation();
    const { mechanics: contextMechanics } = useAppContext();
    const pickedLocation = params?.pickedLocation;

    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const mapRef = useRef(null);
    const listRef = useRef(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.6, duration: 900, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, [pulseAnim]);

    const activeCoords = useMemo(() => {
        if (pickedLocation) return pickedLocation;
        if (location?.coords) {
            return { lat: location.coords.latitude, lng: location.coords.longitude };
        }
        return null;
    }, [pickedLocation, location?.coords]);

    const fetchMechanics = useCallback(async () => {
        if (!activeCoords) return;
        setLoading(true);

        try {
            const { lat, lng } = activeCoords;
            const url =
                `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
                `?location=${lat},${lng}&radius=5000&type=car_repair` +
                `&key=${GOOGLE_MAPS_API_KEY}`;

            const res = await fetch(url);
            const json = await res.json();

            if (json.status === 'OK' && json.results?.length > 0) {
                const places = json.results.map(p => {
                    const pLat = p.geometry.location.lat;
                    const pLng = p.geometry.location.lng;
                    return {
                        id: p.place_id,
                        _id: p.place_id,
                        name: p.name,
                        address: p.vicinity,
                        location: { lat: pLat, lng: pLng },
                        rating: p.rating || 4.0,
                        reviewCount: p.user_ratings_total || 0,
                        estimatedCost: '₹300 – ₹3000',
                        specialties: ['General Repair', 'Car Service'],
                        phone: '',
                        distance: parseFloat(haversine(lat, lng, pLat, pLng).toFixed(2)),
                        source: 'google',
                        openNow: p.opening_hours?.open_now,
                    };
                }).sort((a, b) => a.distance - b.distance);

                setMechanics(places);
                setLoading(false);
                return;
            }
        } catch (err) {
            console.warn('[Places] Request failed:', err.message);
        }

        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 3000);
            const url = `${API_URL}/garages/nearby?lat=${activeCoords.lat}&lng=${activeCoords.lng}&radius=5`;
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timer);
            const json = await res.json();
            if (json.success && json.data.length > 0) {
                setMechanics(json.data);
                setLoading(false);
                return;
            }
        } catch (_err) {
            console.warn('[NearbyMechanics] Backend unreachable, using mock data');
        }

        const withDistance = (contextMechanics || []).map(m => {
            const mLat = m.location?.lat ?? m.lat;
            const mLng = m.location?.lng ?? m.lng;
            if (!mLat || !mLng) return null;
            const dist = haversine(activeCoords.lat, activeCoords.lng, mLat, mLng);
            return { ...m, location: { lat: mLat, lng: mLng }, distance: parseFloat(dist.toFixed(2)) };
        }).filter(Boolean).filter(m => m.distance <= 50)
            .sort((a, b) => a.distance - b.distance);
        setMechanics(withDistance);
        setLoading(false);
    }, [activeCoords, contextMechanics]);

    useEffect(() => {
        if (!locationLoading && activeCoords) {
            fetchMechanics();
        } else if (!locationLoading && !activeCoords) {
            setLoading(false);
        }
    }, [locationLoading, activeCoords, fetchMechanics]);

    const goToUser = () => {
        if (!activeCoords || !mapRef.current) return;
        mapRef.current.animateToRegion(
            {
                latitude: activeCoords.lat,
                longitude: activeCoords.lng,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
            },
            600
        );
    };

    // ── Pan map to selected mechanic ────────────────────────────────────────
    const handleSelectMechanic = (mechanic, index) => {
        setSelectedId(mechanic._id || mechanic.id);
        const lat = mechanic.location?.lat;
        const lng = mechanic.location?.lng;
        if (mapRef.current && lat && lng) {
            mapRef.current.animateToRegion(
                {
                    latitude: (lat + activeCoords.lat) / 2,
                    longitude: (lng + activeCoords.lng) / 2,
                    latitudeDelta: Math.abs(lat - activeCoords.lat) * 2.5 + 0.02,
                    longitudeDelta: Math.abs(lng - activeCoords.lng) * 2.5 + 0.02,
                },
                500
            );
        }
        // Scroll list to selected card
        listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    };

    // ─── Map region ─────────────────────────────────────────────────────────
    const initialRegion = activeCoords
        ? {
            latitude: activeCoords.lat,
            longitude: activeCoords.lng,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
        }
        : undefined;

    return (
        <View style={styles.container}>
            {/* ── MAP ────────────────────────────────────────── */}
            <View style={styles.mapWrapper}>
                {initialRegion ? (
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={initialRegion}
                        showsUserLocation={false}   // We draw our own dot
                        showsCompass={false}
                        showsMyLocationButton={false}
                        pitchEnabled={false}
                    >
                        {/* 5 km search radius ring */}
                        {activeCoords && (
                            <Circle
                                center={{ latitude: activeCoords.lat, longitude: activeCoords.lng }}
                                radius={5000}
                                strokeColor={COLORS.primary + '40'}
                                fillColor={COLORS.primary + '08'}
                                strokeWidth={1.5}
                            />
                        )}

                        {/* User's live blue dot */}
                        {activeCoords && (
                            <Marker
                                coordinate={{
                                    latitude: activeCoords.lat,
                                    longitude: activeCoords.lng,
                                }}
                                anchor={{ x: 0.5, y: 0.5 }}
                                tracksViewChanges={false}
                            >
                                <UserMarker />
                            </Marker>
                        )}

                    </MapView>
                ) : (
                    <View style={styles.mapLoading}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.mapLoadingText}>
                            {locationLoading ? 'Getting your location…' : 'Loading map…'}
                        </Text>
                    </View>
                )}

                {/* ── Map overlay: header pill ─────── */}
                <SafeAreaView pointerEvents="box-none" style={StyleSheet.absoluteFill}>
                    <View style={styles.mapHeader}>
                        <View style={styles.headerPill}>
                            <MapPin size={14} color={COLORS.primary} />
                            <Text style={styles.headerPillText} numberOfLines={1}>
                                {pickedLocation ? 'Custom Location' : 'Your Location'} · 5 km
                            </Text>
                        </View>
                        <View style={styles.mapActions}>
                            {/* Recenter */}
                            <TouchableOpacity style={styles.mapBtn} onPress={goToUser}>
                                <Navigation2 size={18} color={COLORS.primary} />
                            </TouchableOpacity>
                            {/* Refresh */}
                            <TouchableOpacity style={styles.mapBtn} onPress={fetchMechanics}>
                                <RefreshCw size={18} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            {/* ── BOTTOM SHEET LIST ────────────────────── */}
            <View style={styles.sheet}>
                {/* Handle pill */}
                <View style={styles.sheetHandle} />

                {/* Count header */}
                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>
                        {loading
                            ? 'Finding mechanics…'
                            : `${mechanics.length} mechanic${mechanics.length !== 1 ? 's' : ''} nearby`}
                    </Text>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate('LocationPicker', { initialLocation: activeCoords })
                        }
                    >
                        <Text style={styles.changeLocation}>Change location</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={COLORS.primary} />
                        <Text style={styles.loadingText}>Searching nearby mechanics…</Text>
                    </View>
                ) : mechanics.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Wrench size={40} color={COLORS.textLight} />
                        <Text style={styles.emptyTitle}>No mechanics found within 5 km</Text>
                        <TouchableOpacity
                            style={styles.retryBtn}
                            onPress={fetchMechanics}
                        >
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        ref={listRef}
                        data={mechanics}
                        horizontal
                        keyExtractor={(item) => item._id || item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                        onScrollToIndexFailed={() => { }}
                        renderItem={({ item, index }) => (
                            <MechanicCard
                                item={item}
                                index={index}
                                isSelected={(item._id || item.id) === selectedId}
                                onSelect={() => handleSelectMechanic(item, index)}
                                navigation={navigation}
                            />
                        )}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // ─ Map ────────────────────────────────────────────────────────────────────
    mapWrapper: {
        height: MAP_HEIGHT,
        overflow: 'hidden',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapLoading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEF2F8',
        gap: 12,
    },
    mapLoadingText: {
        color: COLORS.textLight,
        fontWeight: '600',
    },

    // ─ Map overlay ────────────────────────────────────────────────────────────
    mapHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.md,
    },
    headerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 6,
        maxWidth: width * 0.55,
        ...SHADOWS.medium,
    },
    headerPillText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
    },
    mapActions: {
        gap: 10,
    },
    mapBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },

    // ─ User dot ───────────────────────────────────────────────────────────────
    userDotOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(0, 122, 255, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2.5,
        borderColor: '#007AFF',
    },
    userDotInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#007AFF',
    },

    // ─ Mechanic marker ────────────────────────────────────────────────────────
    marker: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
        ...SHADOWS.medium,
    },
    markerSelected: {
        backgroundColor: COLORS.primary,
        width: 44,
        height: 44,
        borderRadius: 22,
    },

    // ─ ETA badge ──────────────────────────────────────────────────────────────
    etaBadge: {
        position: 'absolute',
        bottom: -24,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        alignSelf: 'center',
        ...SHADOWS.small,
    },
    etaText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },

    // ─ Sheet ──────────────────────────────────────────────────────────────────
    sheet: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 10,
        ...SHADOWS.large,
    },
    sheetHandle: {
        width: 44,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#DDDDE3',
        alignSelf: 'center',
        marginBottom: 14,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: 14,
    },
    sheetTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.text,
    },
    changeLocation: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '600',
    },

    // ─ Loading / empty ────────────────────────────────────────────────────────
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 12,
        paddingBottom: 40,
    },
    loadingText: {
        color: COLORS.textLight,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingBottom: 40,
    },
    emptyTitle: {
        fontSize: 15,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    retryBtn: {
        marginTop: 6,
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: COLORS.primary + '15',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    retryText: {
        color: COLORS.primary,
        fontWeight: '700',
    },

    // ─ Horizontal card list ────────────────────────────────────────────────────
    horizontalList: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: 6,
        gap: 16,
    },
    card: {
        width: width * 0.86,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 22,
        borderWidth: 1,
        borderColor: '#F2F2F2',
        ...SHADOWS.medium,
    },
    cardSelected: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    cardContent: {
        gap: 14,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardName: {
        fontSize: 19,
        fontWeight: '700',
        color: COLORS.text,
        letterSpacing: -0.3,
    },
    eliteBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 2,
        borderWidth: 1,
        borderColor: '#D4AF3740',
    },
    eliteText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#B8860B',
        textTransform: 'uppercase',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    cardAddress: {
        fontSize: 13,
        color: COLORS.textLight,
        flex: 1,
        fontWeight: '500',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#FFF9E6',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#A88000',
    },
    trustRow: {
        flexDirection: 'row',
        gap: 8,
    },
    experienceTag: {
        backgroundColor: '#F0F4FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    experienceText: {
        fontSize: 11,
        color: COLORS.primary,
        fontWeight: '700',
    },
    specialtyTag: {
        backgroundColor: '#F7F8FA',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    specialtyText: {
        fontSize: 11,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },
    statDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#E0E0E0',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        marginTop: 4,
    },
    navBtn: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: COLORS.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.primary + '20',
    },
    bookBtn: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    bookBtnText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '700',
    },
});

export default NearbyMechanicsScreen;
