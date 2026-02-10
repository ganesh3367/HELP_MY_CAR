import { useRoute } from '@react-navigation/native';
import { MapPin } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ServiceCard from '../components/ServiceCard';
import { COLORS, SHADOWS, SIZES, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { useLocation } from '../context/LocationContext';

const NearbyMechanicsScreen = ({ navigation }) => {
    const { params } = useRoute();
    const { mechanics } = useAppContext();
    const { location, loading: locationLoading } = useLocation();
    const [nearbyMechanics, setNearbyMechanics] = useState([]);
    const [loading, setLoading] = useState(true);

    const filterIssue = params?.filterIssue;
    // New: Allow overriding location via LocationPicker
    const pickedLocation = params?.pickedLocation;

    // Use picked location IF available, else GPS
    const activeLocation = pickedLocation || (location?.coords ? {
        lat: location.coords.latitude,
        lng: location.coords.longitude
    } : null);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    useEffect(() => {
        if (!locationLoading && activeLocation) {
            const userLat = activeLocation.lat;
            const userLon = activeLocation.lng;

            let filtered = mechanics.filter(mechanic => {
                const dist = calculateDistance(userLat, userLon, mechanic.lat, mechanic.lng);
                return dist <= 30; // Increased radius to 30km to find more people
            }).map(mechanic => ({
                ...mechanic,
                computedDistance: calculateDistance(userLat, userLon, mechanic.lat, mechanic.lng).toFixed(1) + ' km'
            }));

            // Mock filtering logic for demo
            if (filterIssue) {
                // In a real app, check mechanic.specialties.includes(filterIssue.id)
                filtered = filtered.filter((_, i) => i % 2 === 0 || i === 0);
            }

            // SORT: By distance
            filtered.sort((a, b) => parseFloat(a.computedDistance) - parseFloat(b.computedDistance));

            setNearbyMechanics(filtered);
            setLoading(false);
        } else if (!locationLoading && !activeLocation) {
            setLoading(false);
        }
    }, [location, locationLoading, mechanics, filterIssue, pickedLocation]);

    const renderSkeleton = () => (
        <View style={styles.skeletonContainer}>
            {[1, 2, 3].map((i) => (
                <View key={i} style={styles.skeletonCard}>
                    <LoadingSkeleton width="70%" height={20} style={{ marginBottom: 10 }} />
                    <LoadingSkeleton width="40%" height={15} style={{ marginBottom: 20 }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <LoadingSkeleton width="30%" height={30} borderRadius={15} />
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <LoadingSkeleton width={40} height={40} borderRadius={20} />
                            <LoadingSkeleton width={40} height={40} borderRadius={20} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Clickable Header for Location */}
            <TouchableOpacity
                style={styles.header}
                onPress={() => navigation.navigate('LocationPicker', { initialLocation: activeLocation })}
                activeOpacity={0.8}
            >
                <View style={styles.headerRow}>
                    <MapPin size={24} color={COLORS.primary} />
                    <Text style={styles.title}>
                        {filterIssue ? 'Matching Mechanics' : 'Nearby Help'}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.subtitle}>
                        {pickedLocation ? '📍 Pin Location (Tap to change)' : filterIssue ? `Specialists near you` : 'Mechanics near you'}
                    </Text>
                    {pickedLocation && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary }} />}
                </View>
            </TouchableOpacity>

            {loading ? (
                renderSkeleton()
            ) : (
                <FlatList
                    data={nearbyMechanics}
                    keyExtractor={(item) => item._id || item.id}
                    renderItem={({ item }) => (
                        <ServiceCard
                            title={item.name}
                            distance={item.computedDistance || item.distance}
                            rating={item.rating}
                            cost={item.estimatedCost}
                            phone={item.phone}
                            lat={item.lat}
                            lng={item.lng}
                            onProceed={() => navigation.navigate('MechanicProfile', { mechanic: item })}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MapPin size={48} color={COLORS.textLight} />
                            <Text style={styles.emptyText}>No mechanics found within 10km.</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={() => { }}>
                                <Text style={styles.retryText}>Expand Search Radius</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.lg,
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        ...SHADOWS.medium,
        marginBottom: SPACING.md,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 5,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    skeletonContainer: {
        paddingHorizontal: SPACING.lg,
    },
    skeletonCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: SIZES.radius,
        marginBottom: SPACING.md,
        ...SHADOWS.medium,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        gap: 15,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textLight,
        fontWeight: '600',
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '15',
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    retryText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 14,
    }
});

export default NearbyMechanicsScreen;
