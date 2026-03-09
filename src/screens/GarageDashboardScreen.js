import {
    Bell,
    ChevronRight,
    Clock,
    DollarSign,
    LayoutDashboard,
    Package,
    Settings,
    Star,
    TrendingUp
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const GarageDashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const {
        myGarage,
        fetchGarageByOwner,
        garageOrders,
        fetchGarageOrders,
        toggleGarageStatus,
        unreadOrders,
        clearUnreadOrders
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
        { label: 'Total Jobs', value: garageOrders.length || '0', icon: Package, color: '#3B82F6' },
        { label: 'Avg Rating', value: (myGarage?.rating || 0).toFixed(1), icon: Star, color: '#F59E0B' },
        { label: 'Revenue', value: `₹${totalRevenue}`, icon: DollarSign, color: '#10B981' },
        { label: 'Active', value: activeJobs.length || '0', icon: Clock, color: '#6366F1' },
    ];

    const quickActions = [
        { title: 'Orders', icon: LayoutDashboard, color: '#3B82F6', route: 'Orders' },
        { title: 'Profile', icon: Settings, color: '#6B7280', route: 'EditGarageProfile' },
        { title: 'Analytics', icon: TrendingUp, color: '#10B981', route: 'Dashboard' },
        { title: 'Reviews', icon: Star, color: '#F59E0B', route: 'Dashboard' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            >
                {/* ── Dashboard Header ────────────────────────────────────────── */}
                <View style={styles.headerArea}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.greeting}>Good Day,</Text>
                            <Text style={styles.garageName}>{myGarage?.name || 'Your Garage'}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.profileBtn}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{(user?.name || 'G').charAt(0).toUpperCase()}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Status Ribbon */}
                    <View style={[styles.statusRibbon, { backgroundColor: myGarage?.isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)' }]}>
                        <View style={[styles.statusDot, { backgroundColor: myGarage?.isOnline ? '#10B981' : '#6B7280' }]} />
                        <Text style={[styles.statusLabel, { color: myGarage?.isOnline ? '#065F46' : '#374151' }]}>
                            {myGarage?.isOnline ? 'Business is Online & Accepting Requests' : 'Currently Offline'}
                        </Text>
                    </View>
                </View>

                {unreadOrders.length > 0 && (
                    <TouchableOpacity
                        style={styles.notificationBanner}
                        onPress={() => {
                            clearUnreadOrders();
                            navigation.navigate('Orders');
                        }}
                    >
                        <View style={styles.notificationIcon}>
                            <Bell size={18} color={COLORS.white} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.notificationTitle}>New Orders Pending!</Text>
                            <Text style={styles.notificationSub}>You have {unreadOrders.length} new service request{unreadOrders.length > 1 ? 's' : ''}.</Text>
                        </View>
                        <ChevronRight size={18} color="#D97706" />
                    </TouchableOpacity>
                )}

                {/* ── Business Controls ────────────────────────────────────────── */}
                <View style={styles.controlRow}>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleTitle}>Availability</Text>
                        <Text style={styles.toggleSub}>Appear on user maps</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.mainToggle, { backgroundColor: myGarage?.isOnline ? COLORS.primary : '#E5E7EB' }]}
                        onPress={handleToggleStatus}
                        disabled={toggling}
                    >
                        {toggling ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                            <View style={[styles.toggleCircle, { alignSelf: myGarage?.isOnline ? 'flex-end' : 'flex-start' }]} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* ── Stats Grid ──────────────────────────────────────────────── */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, idx) => (
                        <View key={idx} style={styles.statCard}>
                            <View style={[styles.statIconFrame, { backgroundColor: stat.color + '15' }]}>
                                <stat.icon size={18} color={stat.color} />
                            </View>
                            <View>
                                <Text style={styles.statVal}>{stat.value}</Text>
                                <Text style={styles.statLab}>{stat.label}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* ── Quick Actions ─────────────────────────────────────────── */}
                <Text style={styles.sectionTitle}>Quick Management</Text>
                <View style={styles.actionsGrid}>
                    {quickActions.map((action, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.actionItem}
                            onPress={() => navigation.navigate(action.route)}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: action.color + '10' }]}>
                                <action.icon size={22} color={action.color} />
                            </View>
                            <Text style={styles.actionLabel}>{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Active Jobs ───────────────────────────────────────────── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Upcoming & Active Jobs</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                {activeJobs.length > 0 ? (
                    activeJobs.slice(0, 3).map((order) => (
                        <TouchableOpacity
                            key={order.id}
                            style={styles.jobCard}
                            onPress={() => navigation.navigate('Orders')}
                        >
                            <View style={styles.jobContent}>
                                <View style={styles.jobMain}>
                                    <Text style={styles.carText}>{order.vehicleDetails.make} {order.vehicleDetails.model}</Text>
                                    <Text style={styles.jobIssue} numberOfLines={1}>{order.vehicleDetails.issue}</Text>
                                    <View style={styles.timeRow}>
                                        <Clock size={12} color={COLORS.textLight} />
                                        <Text style={styles.timeLabel}>Request received {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    </View>
                                </View>
                                <View style={[styles.statusTag, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                                    <Text style={[styles.tagText, { color: getStatusColor(order.status) }]}>{order.status.replace('_', ' ')}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBg}>
                            <Package size={28} color="#9CA3AF" />
                        </View>
                        <Text style={styles.emptyTitle}>Queue is Empty</Text>
                        <Text style={styles.emptySub}>Switch online to start receiving new service requests from nearby users.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const getStatusColor = (status) => {
    switch (status) {
        case 'PENDING': return '#F59E0B';
        case 'ACCEPTED': return '#3B82F6';
        case 'ON_THE_WAY': return '#8B5CF6';
        case 'ARRIVED': return '#10B981';
        case 'IN_PROGRESS': return '#3B82F6';
        default: return '#6B7280';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    // ─ Header Area ────────────────────────────────────────────────────────
    headerArea: {
        marginBottom: SPACING.xl,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    greeting: {
        fontSize: 14,
        color: COLORS.textLight,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    garageName: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
        marginTop: 2,
    },
    profileBtn: {
        borderRadius: 20,
        padding: 2,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
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
    statusRibbon: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    // ─ Notification ───────────────────────────────────────────────────────
    notificationBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        padding: 14,
        borderRadius: 16,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: '#FEF3C7',
        gap: 12,
    },
    notificationIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F59E0B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#92400E',
    },
    notificationSub: {
        fontSize: 12,
        color: '#B45309',
        marginTop: 2,
    },
    // ─ Controls ───────────────────────────────────────────────────────────
    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 24,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...SHADOWS.medium,
    },
    toggleContainer: {
        flex: 1,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },
    toggleSub: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 2,
    },
    mainToggle: {
        width: 52,
        height: 28,
        borderRadius: 14,
        padding: 3,
        justifyContent: 'center',
    },
    toggleCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    },
    // ─ Stats Grid ─────────────────────────────────────────────────────────
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: SPACING.xl,
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        width: (width - SPACING.lg * 2 - 12) / 2,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    statIconFrame: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statVal: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },
    statLab: {
        fontSize: 11,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    // ─ Quick Actions ──────────────────────────────────────────────────────
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 12,
    },
    actionsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: SPACING.xl,
    },
    actionItem: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.text,
    },
    // ─ Jobs List ──────────────────────────────────────────────────────────
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    seeAll: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '700',
    },
    jobCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...SHADOWS.small,
    },
    jobContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    jobMain: {
        flex: 1,
        marginRight: 10,
    },
    carText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },
    jobIssue: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 2,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 10,
    },
    timeLabel: {
        fontSize: 11,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    statusTag: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    // ─ Empty State ────────────────────────────────────────────────────────
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    emptyIconBg: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    emptySub: {
        fontSize: 13,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: 6,
        paddingHorizontal: 40,
        lineHeight: 18,
    },
});

export default GarageDashboardScreen;
