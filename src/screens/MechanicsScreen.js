import { Filter, Search, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ServiceCard from '../components/ServiceCard';
import { COLORS, SHADOWS, SIZES, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';

const MechanicsScreen = () => {
    const { mechanics } = useAppContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMechanics, setFilteredMechanics] = useState(mechanics);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const filtered = mechanics.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredMechanics(filtered);
    }, [searchQuery, mechanics]);

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
            <View style={styles.header}>
                <Text style={styles.title}>Mechanics</Text>
                <View style={styles.searchRow}>
                    <View style={styles.searchBar}>
                        <Search size={18} color={COLORS.textLight} />
                        <TextInput
                            style={styles.input}
                            placeholder="Search by name or specialty..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery !== '' && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={18} color={COLORS.textLight} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity style={styles.filterButton}>
                        <Filter size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                renderSkeleton()
            ) : (
                <FlatList
                    data={filteredMechanics}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ServiceCard
                            title={item.name}
                            distance={item.distance}
                            rating={item.rating}
                            cost={item.estimatedCost}
                            phone={item.phone}
                            lat={item.lat}
                            lng={item.lng}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No mechanics found.</Text>
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
        paddingTop: SPACING.md,
        paddingBottom: SPACING.md,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.md,
        borderRadius: 12,
        height: 48,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: COLORS.text,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FFF5E6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FFE0B3',
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
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textLight,
    },
});

export default MechanicsScreen;
