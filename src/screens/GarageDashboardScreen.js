import { BarChart3, Clock, DollarSign, Package, Star, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SIZES, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const GarageDashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { myGarage, fetchGarageByOwner, garageOrders, fetchGarageOrders } = useAppContext();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user?.email) {
            loadDashboardData();
        }
    }, [user?.email]);

    const loadDashboardData = async () => {
        const garage = await fetchGarageByOwner(user.email);
        if (garage?.id) {
            await fetchGarageOrders(garage.id);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    const activeJobs = garageOrders.filter(o =>
        ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(o.status)
    );

    const stats = [
        { label: 'Total Jobs', value: garageOrders.length || '0', icon: Package, color: '#007AFF' },
        { label: 'Rating', value: myGarage?.rating || '0.0', icon: Star, color: '#FF9500' },
        { label: 'Revenue', value: '₹0', icon: DollarSign, color: '#34C759' },
        { label: 'Growth', value: '+0%', icon: TrendingUp, color: '#5856D6' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.garageName}>{myGarage?.name || 'Your Garage'}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{(user?.name || 'G').charAt(0)}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Quick Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                                <stat.icon size={20} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Active Jobs Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Jobs ({activeJobs.length})</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('GarageOrders')}>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                {activeJobs.length > 0 ? (
                    activeJobs.slice(0, 3).map((order) => (
                        <TouchableOpacity
                            key={order.id}
                            style={styles.jobCard}
                            onPress={() => navigation.navigate('GarageOrders')}
                        >
                            <View style={styles.jobInfo}>
                                <Text style={styles.carName}>{order.vehicleDetails.make} {order.vehicleDetails.model}</Text>
                                <Text style={styles.issueText}>{order.vehicleDetails.issue}</Text>
                                <View style={styles.statusRow}>
                                    <Clock size={12} color={COLORS.textLight} />
                                    <Text style={styles.timeText}>Ordered {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                </View>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                                <Text style={[styles.statusTabText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyCard}>
                        <BarChart3 size={40} color={COLORS.textLight} />
                        <Text style={styles.emptyTitle}>No Active Jobs</Text>
                        <Text style={styles.emptySub}>When users request services, they will appear here.</Text>
                    </View>
                )}

                {/* Performance Chart Placeholder */}
                <View style={styles.performanceCard}>
                    <Text style={styles.perfTitle}>Weekly Performance</Text>
                    <View style={styles.chartPlaceholder}>
                        <Text style={styles.perfMessage}>Performance analytics will appear here after more jobs are completed.</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const getStatusColor = (status) => {
    switch (status) {
        case 'PENDING': return COLORS.warning;
        case 'ACCEPTED': return COLORS.primary;
        case 'ON_THE_WAY': return '#5856D6';
        case 'ARRIVED': return COLORS.success;
        case 'IN_PROGRESS': return COLORS.info;
        default: return COLORS.textLight;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        marginTop: SPACING.md,
    },
    greeting: {
        fontSize: 14,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    garageName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    profileButton: {
        ...SHADOWS.small,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    avatarText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: SPACING.xl,
    },
    statCard: {
        width: (SIZES.width - SPACING.lg * 2 - 12) / 2,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SPACING.md,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    viewAll: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
    jobCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: 10,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    jobInfo: {
        flex: 1,
    },
    carName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    issueText: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 2,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 4,
    },
    timeText: {
        fontSize: 11,
        color: COLORS.textLight,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusTabText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderStyle: 'dashed',
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 12,
    },
    emptySub: {
        fontSize: 13,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: 4,
    },
    performanceCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SPACING.md,
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl,
        ...SHADOWS.small,
    },
    perfTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    chartPlaceholder: {
        height: 120,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
    },
    perfMessage: {
        fontSize: 12,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 18,
    }
});

export default GarageDashboardScreen;
