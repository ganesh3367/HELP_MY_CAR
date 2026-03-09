import { AlertCircle, Truck } from 'lucide-react-native';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceCard from '../components/ServiceCard';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';

import { useLocation } from '../context/LocationContext';

const TowingScreen = () => {
    const { towingServices } = useAppContext();
    const { location } = useLocation();

    // Default to a generic Pune location string if coordinates exist but no reverse geocoding is available
    const locationName = location?.coords ? 'Pune, Maharashtra' : 'Fetching location...';

    return (
        <SafeAreaView style={styles.container}>
            {/* Professional Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.iconCircle}>
                        <Truck size={28} color="#FF9500" />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>Towing Services</Text>
                        <Text style={styles.subtitle}>Showing nearby services in</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <AlertCircle size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                            <Text style={styles.locationText}>{locationName}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.availabilityPill}>
                    <View style={styles.liveDot} />
                    <Text style={styles.availabilityText}>Available Now</Text>
                </View>
            </View>

            {/* Services List */}
            {towingServices && towingServices.length > 0 ? (
                <FlatList
                    data={towingServices}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ServiceCard
                            title={item.type}
                            distance={item.availability === 'Available' ? 'Nearby' : item.availability}
                            cost={item.costPerKm}
                            phone={item.phone}
                            image={item.image}
                            lat={item.lat || 18.5204}
                            lng={item.lng || 73.8567}
                            type="towing"
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <Text style={styles.sectionLabel}>
                            {towingServices.length} service{towingServices.length !== 1 ? 's' : ''} available
                        </Text>
                    }
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIcon}>
                        <AlertCircle size={48} color={COLORS.textLight} />
                    </View>
                    <Text style={styles.emptyTitle}>No Towing Services</Text>
                    <Text style={styles.emptyText}>
                        No towing services are available in your area right now. Please try again later.
                    </Text>
                </View>
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
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.xl,
        paddingTop: Platform.OS === 'ios' ? 60 : SPACING.xl,
        paddingBottom: SPACING.xxl,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        ...SHADOWS.large,
        shadowColor: '#FF9500',
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
        marginBottom: SPACING.md,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 20,
        backgroundColor: '#FFF4E5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        fontWeight: '600',
        marginTop: 4,
    },
    locationText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FF9500',
    },
    availabilityPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 24,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#16A34A',
        marginRight: 8,
    },
    availabilityText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#16A34A',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    availabilityText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.success,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: SPACING.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    list: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default TowingScreen;
