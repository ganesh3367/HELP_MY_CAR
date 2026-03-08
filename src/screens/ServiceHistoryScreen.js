import { Calendar, CheckCircle, Clock, RefreshControl } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const ServiceHistoryScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { userOrders, fetchUserOrders } = useAppContext();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchUserOrders(user.id);
        }
    }, [user?.id]);

    const onRefresh = async () => {
        setRefreshing(true);
        if (user?.id) {
            await fetchUserOrders(user.id);
        }
        setRefreshing(false);
    };

    const renderItem = ({ item }) => {
        const dateObj = new Date(item.createdAt);
        const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        return (
            <TouchableOpacity style={styles.historyCard}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.serviceText}>{item.vehicleDetails?.serviceType || 'Car Service'}</Text>
                        <Text style={styles.providerText}>{item.garageName}</Text>
                    </View>
                    <Text style={styles.costText}>{item.cost || 'TBD'}</Text>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.detailRow}>
                        <Calendar size={14} color={COLORS.textLight} />
                        <Text style={styles.detailText}>{dateStr}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Clock size={14} color={COLORS.textLight} />
                        <Text style={styles.detailText}>{timeStr}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'COMPLETED' ? '#E6F7ED' : '#FFF9E6' }]}>
                        <CheckCircle size={12} color={item.status === 'COMPLETED' ? COLORS.success : COLORS.warning} />
                        <Text style={[styles.statusText, { color: item.status === 'COMPLETED' ? COLORS.success : COLORS.warning }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Service History</Text>
            </View>

            {userOrders && userOrders.length > 0 ? (
                <FlatList
                    data={userOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No service history found.</Text>
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
        padding: SPACING.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    list: {
        padding: SPACING.lg,
    },
    historyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.medium,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    serviceText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    providerText: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 2,
    },
    costText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: SPACING.md,
        gap: SPACING.md,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 12,
        color: COLORS.textLight,
        marginLeft: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6F7ED',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 'auto',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.success,
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textLight,
    },
});

export default ServiceHistoryScreen;
