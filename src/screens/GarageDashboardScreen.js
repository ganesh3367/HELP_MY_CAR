import { ArrowLeft, BarChart3, Clock, DollarSign, Package, Star, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
    const {
        myGarage,
        fetchGarageByOwner,
        garageOrders,
        fetchGarageOrders,
        toggleGarageStatus
    } = useAppContext();
    const [refreshing, setRefreshing] = useState(false);
    const [toggling, setToggling] = useState(false);

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

    const handleToggleStatus = async () => {
        if (!myGarage?.id) return;
        setToggling(true);
        await toggleGarageStatus(myGarage.id, !myGarage.isOnline);
        setToggling(false);
    };

    const activeJobs = garageOrders.filter(o =>
        ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(o.status)
    );

    const totalRevenue = garageOrders
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, o) => {
            const cost = parseInt(o.cost?.replace(/[^0-9]/g, '') || '0');
            return sum + cost;
        }, 0);

    const stats = [
        { label: 'Total Jobs', value: garageOrders.length || '0', icon: Package, color: '#007AFF' },
        { label: 'Rating', value: (myGarage?.rating || 0).toFixed(1), icon: Star, color: '#FF9500' },
        { label: 'Revenue', value: `₹${totalRevenue}`, icon: DollarSign, color: '#34C759' },
        { label: 'Growth', value: '+12%', icon: TrendingUp, color: '#5856D6' },
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
                        <View style={styles.statusIndicatorContainer}>
                            <View style={[styles.statusDot, { backgroundColor: myGarage?.isOnline ? COLORS.success : '#C7C7CC' }]} />
                            <Text style={styles.statusLabel}>{myGarage?.isOnline ? 'Online & Visible' : 'Offline'}</Text>
                        </View>
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

                {/* Status Toggle Card */}
                <View style={styles.toggleCard}>
                    <View>
                        <Text style={styles.toggleTitle}>Business Status</Text>
                        <Text style={styles.toggleSub}>When offline, users won't see your garage</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.toggleBtn, { backgroundColor: myGarage?.isOnline ? '#E6F7ED' : '#F2F2F7' }]}
                        onPress={handleToggleStatus}
                        disabled={toggling}
                    >
                        {toggling ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                            <Text style={[styles.toggleBtnText, { color: myGarage?.isOnline ? COLORS.success : COLORS.textLight }]}>
                                {myGarage?.isOnline ? 'ONLINE' : 'OFFLINE'}
                            </Text>
                        )}
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

                {/* Quick Actions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Manage Business</Text>
                </View>
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('EditGarageProfile')}
                >
                    <Star size={20} color={COLORS.primary} />
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Business Profile</Text>
                        <Text style={styles.actionSub}>Update name, address, and specialties</Text>
                    </View>
                    <ArrowLeft size={20} color={COLORS.textLight} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>

                {/* Active Jobs Section */}
                <View style={[styles.sectionHeader, { marginTop: SPACING.xl }]}>
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
    statusIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    toggleCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 18,
        marginBottom: SPACING.xl,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    toggleTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    toggleSub: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },
    toggleBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        minWidth: 80,
        alignItems: 'center',
    },
    toggleBtnText: {
        fontSize: 11,
        fontWeight: '900',
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 18,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    actionContent: {
        flex: 1,
        marginLeft: 12,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    actionSub: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
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
