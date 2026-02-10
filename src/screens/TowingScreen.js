import { AlertCircle, Truck } from 'lucide-react-native';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import ServiceCard from '../components/ServiceCard';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';

const TowingScreen = () => {
    const { towingServices } = useAppContext();

    return (
        <SafeAreaView style={styles.container}>
            {/* Professional Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.iconCircle}>
                        <Truck size={28} color={COLORS.white} />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>Towing Services</Text>
                        <Text style={styles.subtitle}>24/7 roadside towing assistance</Text>
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
                            distance={item.availability}
                            cost={item.costPerKm}
                            phone={item.phone}
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
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.lg,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        ...SHADOWS.medium,
        marginBottom: SPACING.sm,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#5856D6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
        ...SHADOWS.small,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        fontWeight: '500',
        marginTop: 2,
    },
    availabilityPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6F7ED',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#B7EB8F',
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.success,
        marginRight: 6,
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
