import { Calendar, CheckCircle, Clock } from 'lucide-react-native';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

const MOCK_HISTORY = [
    {
        id: '1',
        service: 'Engine Repair',
        provider: 'Quick Fix Motors',
        date: 'Oct 24, 2025',
        time: '10:30 AM',
        status: 'Completed',
        cost: '$85.00',
    },
    {
        id: '2',
        service: 'Towing Service',
        provider: 'Elite Towing',
        date: 'Sep 12, 2025',
        time: '02:15 PM',
        status: 'Completed',
        cost: '$45.00',
    },
];

const ServiceHistoryScreen = ({ navigation }) => {
    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.historyCard}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.serviceText}>{item.service}</Text>
                    <Text style={styles.providerText}>{item.provider}</Text>
                </View>
                <Text style={styles.costText}>{item.cost}</Text>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.detailRow}>
                    <Calendar size={14} color={COLORS.textLight} />
                    <Text style={styles.detailText}>{item.date}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Clock size={14} color={COLORS.textLight} />
                    <Text style={styles.detailText}>{item.time}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <CheckCircle size={12} color={COLORS.success} />
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Service History</Text>
            </View>

            {MOCK_HISTORY.length > 0 ? (
                <FlatList
                    data={MOCK_HISTORY}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
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
