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
import { COLORS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { useLocation } from '../context/LocationContext';
import { API_URL } from '../config';


const GOOGLE_MAPS_API_KEY = 'AIzaSyA3oFvnPMBJWcPLvqSHHvLcMfgbxLNq7oo';


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

const NearbyMechanicsScreen = ({ navigation }) => {
    const { params } = useRoute();
    const { location, loading: locationLoading } = useLocation();
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
                const places = json.results
                    .filter(p => p.geometry?.location?.lat && p.geometry?.location?.lng)
                    .map(p => {
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
            if (err.name !== 'AbortError') {
                console.warn('[Places] Request failed:', err.message);
            }
        }

        
        try {
            
            const backendUrl = `${API_URL}/garages/nearby?lat=${activeCoords.lat}&lng=${activeCoords.lng}&radius=5`;
            const res = await fetch(backendUrl);
            const json = await res.json();

            if (json.success && json.data.length > 0) {
                setMechanics(json.data);
                setLoading(false);
                return;
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.warn('[NearbyMechanics] Backend unreachable, using mock data');
            }
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
    }, [locationLoading, activeCoords?.lat, activeCoords?.lng, fetchMechanics]);

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
        
        listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    };

    
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
            {}
            <View style={styles.mapWrapper}>
                {initialRegion ? (
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={initialRegion}
                        showsUserLocation={false}   
                        showsCompass={false}
                        showsMyLocationButton={false}
                        pitchEnabled={false}
                    >
                        {}
                        {activeCoords && (
                            <Circle
                                center={{ latitude: activeCoords.lat, longitude: activeCoords.lng }}
                                radius={5000}
                                strokeColor={COLORS.primary + '40'}
                                fillColor={COLORS.primary + '08'}
                                strokeWidth={1.5}
                            />
                        )}

                        {}
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

                {}
                <SafeAreaView pointerEvents="box-none" style={StyleSheet.absoluteFill}>
                    <View style={styles.mapHeader}>
                        <View style={styles.headerPill}>
                            <MapPin size={14} color={COLORS.primary} />
                            <Text style={styles.headerPillText} numberOfLines={1}>
                                {pickedLocation ? 'Custom Location' : 'Your Location'} · 5 km
                            </Text>
                        </View>
                        <View style={styles.mapActions}>
                            {}
                            <TouchableOpacity style={styles.mapBtn} onPress={goToUser}>
                                <Navigation2 size={18} color={COLORS.primary} />
                            </TouchableOpacity>
                            {}
                            <TouchableOpacity style={styles.mapBtn} onPress={fetchMechanics}>
                                <RefreshCw size={18} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            {}
            <View style={styles.sheet}>
                {}
                <View style={styles.sheetHandle} />

                {}
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
    
    mapWrapper: {
        height: MAP_HEIGHT,
        backgroundColor: '#F5F5F5',
    },
    map: {
        flex: 1,
    },
    mapLoading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapLoadingText: {
        marginTop: 8,
        color: COLORS.textLight,
    },
    mapHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING?.md || 16,
        paddingTop: SPACING?.md || 16,
    },
    headerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.95)',
    },
    headerPillText: {
        marginLeft: 6,
        fontSize: 12,
        color: COLORS.text,
    },
    mapActions: {
        flexDirection: 'row',
        gap: 8,
    },
    mapBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.95)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    marker: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary + '40',
    },
    markerSelected: {
        backgroundColor: COLORS.primary,
    },
    userDotOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: COLORS.primary + '25',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userDotInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    
    sheet: {
        flex: 1,
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 8,
        paddingBottom: 24,
    },
    sheetHandle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E5E7EB',
        marginBottom: 8,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    sheetTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    changeLocation: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '600',
    },
    loadingContainer: {
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 8,
        fontSize: 13,
        color: COLORS.textLight,
    },
    emptyContainer: {
        paddingVertical: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
    },
    retryBtn: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    retryText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '600',
    },
    horizontalList: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 12,
    },
    
    card: {
        width: width * 0.8,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginRight: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 3,
    },
    cardSelected: {
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    cardContent: {
        gap: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    cardName: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },
    eliteBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: '#FFF7E6',
        marginLeft: 4,
    },
    eliteText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#D97706',
        marginLeft: 3,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        gap: 4,
    },
    cardAddress: {
        fontSize: 12,
        color: COLORS.textLight,
        flex: 1,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
    },
    trustRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    experienceTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#EEF2FF',
    },
    experienceText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4F46E5',
    },
    specialtyTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#ECFEFF',
    },
    specialtyText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#0F766E',
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statDot: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#D1D5DB',
    },
    statText: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    navBtn: {
        width: 40,
        height: 40,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.primary + '40',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookBtn: {
        flex: 1,
        marginLeft: 10,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    etaBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: COLORS.primary + '15',
    },
    etaText: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.primary,
    },
});

export default NearbyMechanicsScreen;
