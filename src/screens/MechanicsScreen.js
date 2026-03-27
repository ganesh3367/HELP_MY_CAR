import { useNavigation } from '@react-navigation/native';
import {
    CheckCircle,
    ChevronDown,
    Clock,
    Filter,
    MapPin,
    Navigation,
    Phone, Search,
    ShieldCheck,
    Star, Wrench, X
} from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated, Dimensions, FlatList, Modal,
    Platform,
    ScrollView,
    StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { useLocation } from '../context/LocationContext';

const { width } = Dimensions.get('window');

const SORT_OPTIONS = [
    { key: 'rating', label: 'Top Rated' },
    { key: 'distance', label: 'Nearest' },
    { key: 'name', label: 'A–Z' },
];

const SPECIALTY_FILTERS = [
    'All',
    'Engine Repair',
    'Electrical',
    'Tyre Change',
    'AC Service',
    'Brakes',
    'Towing',
    'Battery',
    'Suspension',
];

const haversine = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
    const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const MechanicCard = ({ item, dist, index, onBook, onProfile }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const isAvailable = item.available !== false;
    const etaMin = dist < 50 ? Math.ceil(dist * 3) : null;
    const isElite = (item.rating || 0) >= 4.5;
    const experience = item.yearsOfExperience || (isElite ? 10 + (index % 5) : 3 + (index % 7));

    const translateY = useRef(new Animated.Value(50)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8, delay: index * 100 }),
            Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true, delay: index * 100 })
        ]).start();
    }, []);

    const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();


    return (
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }, { translateY }], opacity }]}>
            <TouchableOpacity activeOpacity={1} onPressIn={onPressIn} onPressOut={onPressOut} onPress={onProfile}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.nameRow}>
                            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                            {isElite && (
                                <View style={styles.eliteBadge}>
                                    <ShieldCheck size={12} color="#D4AF37" />
                                    <Text style={styles.eliteText}>Elite</Text>
                                </View>
                            )}
                            {item.verified && !isElite && (
                                <View style={styles.verifiedBadge}>
                                    <CheckCircle size={10} color={COLORS.white} />
                                    <Text style={styles.verifiedText}>Verified</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.ratingRow}>
                            <Star size={14} color="#FFB800" fill="#FFB800" />
                            <Text style={styles.ratingText}>{item.rating?.toFixed(1)}</Text>
                            <Text style={styles.reviewText}>{item.reviewCount || 0} reviews</Text>
                        </View>
                        <View style={styles.addressRow}>
                            <MapPin size={12} color={COLORS.textLight} />
                            <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isAvailable ? '#E8F5E9' : '#FFEBEE' }]}>
                        <View style={[styles.statusDot, { backgroundColor: isAvailable ? '#2E7D32' : '#C62828' }]} />
                        <Text style={[styles.statusText, { color: isAvailable ? '#2E7D32' : '#C62828' }]}>
                            {isAvailable ? 'Available' : 'Busy'}
                        </Text>
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

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Clock size={14} color={COLORS.textLight} />
                        <Text style={styles.infoText}>{etaMin ? `${etaMin} min` : '5 min'}</Text>
                    </View>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoItem}>
                        <MapPin size={14} color={COLORS.textLight} />
                        <Text style={styles.infoText}>{dist && dist < 1000 ? `${dist.toFixed(1)} km` : 'Far'}</Text>
                    </View>
                </View>

                <View style={styles.cardActions}>
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
                        style={styles.callBtn}
                        onPress={() => item.phone && require('react-native').Linking.openURL(`tel:${item.phone}`)}
                    >
                        <Phone size={16} color={COLORS.primary} />
                        <Text style={styles.callBtnText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.bookBtn, !isAvailable && styles.bookBtnDisabled]}
                        onPress={isAvailable ? onBook : null}
                    >
                        <Wrench size={16} color={COLORS.white} />
                        <Text style={styles.bookBtnText}>
                            {isAvailable ? 'Book' : 'Busy'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const MechanicsScreen = () => {
    const navigation = useNavigation();
    const { mechanics, allGarages } = useAppContext();
    const { location } = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const [sortKey, setSortKey] = useState('rating');
    const [showSortModal, setShowSortModal] = useState(false);
    const [availableOnly, setAvailableOnly] = useState(false);
    const [loading, setLoading] = useState(true);

    const userLat = location?.coords?.latitude;
    const userLng = location?.coords?.longitude;

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(t);
    }, []);

    const processed = useMemo(() => {
        
        const baseList = searchQuery.trim() ? allGarages : mechanics;

        let list = baseList.map(m => ({
            ...m,
            _dist: haversine(userLat, userLng, m.lat ?? m.location?.lat, m.lng ?? m.location?.lng),
            verified: m.verified ?? Math.random() > 0.4,
            available: m.isOnline !== false, 
            reviewCount: m.reviewCount ?? m.reviews?.length ?? Math.floor(Math.random() * 200 + 10),
        }));

        
        if (!searchQuery.trim()) {
            list = list.filter(m => m.isOnline !== false);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(m =>
                m.name?.toLowerCase().includes(q) ||
                m.specialties?.some(s => s.toLowerCase().includes(q)) ||
                m.address?.toLowerCase().includes(q)
            );
        }

        
        if (selectedSpecialty !== 'All') {
            list = list.filter(m => m.specialties?.some(s =>
                s.toLowerCase().includes(selectedSpecialty.toLowerCase())
            ));
        }

        if (availableOnly) list = list.filter(m => m.available !== false);

        list.sort((a, b) => {
            if (sortKey === 'rating') return (b.rating || 0) - (a.rating || 0);
            if (sortKey === 'distance') return a._dist - b._dist;
            if (sortKey === 'name') return (a.name || '').localeCompare(b.name || '');
            return 0;
        });

        return list;
    }, [mechanics, allGarages, searchQuery, selectedSpecialty, sortKey, availableOnly, userLat, userLng]);

    const activeSortLabel = SORT_OPTIONS.find(o => o.key === sortKey)?.label || '★ Top Rated';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Mechanics</Text>
                    <Text style={styles.subtitle}>{processed.length} available</Text>
                </View>

                {}
                <View style={styles.searchRow}>
                    <View style={styles.searchBar}>
                        <Search size={18} color={COLORS.textLight} />
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            placeholderTextColor={COLORS.textLight}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery !== '' && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={18} color={COLORS.textLight} />
                            </TouchableOpacity>
                        )}
                    </View>
                    {}
                    <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSortModal(true)}>
                        <Filter size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {}
                <View style={styles.controlRow}>
                    <TouchableOpacity style={styles.sortChip} onPress={() => setShowSortModal(true)}>
                        <Text style={styles.sortChipText}>{activeSortLabel}</Text>
                        <ChevronDown size={12} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.availToggle, availableOnly && styles.availToggleActive]}
                        onPress={() => setAvailableOnly(!availableOnly)}
                    >
                        <View style={[styles.toggleDot, availableOnly && { backgroundColor: COLORS.white }]} />
                        <Text style={[styles.toggleText, availableOnly && { color: COLORS.white }]}>
                            Available Now
                        </Text>
                    </TouchableOpacity>
                </View>

                {}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {SPECIALTY_FILTERS.map(f => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterChip, selectedSpecialty === f && styles.filterChipActive]}
                            onPress={() => setSelectedSpecialty(f)}
                        >
                            <Text style={[styles.filterChipText, selectedSpecialty === f && { color: COLORS.white }]}>
                                {f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={{ padding: SPACING.lg }}>
                    {[1, 2, 3].map(i => (
                        <View key={i} style={[styles.card, { marginBottom: 16 }]}>
                            <LoadingSkeleton width="70%" height={18} style={{ marginBottom: 10 }} />
                            <LoadingSkeleton width="40%" height={13} style={{ marginBottom: 14 }} />
                            <LoadingSkeleton width="100%" height={40} borderRadius={12} />
                        </View>
                    ))}
                </View>
            ) : (
                <FlatList
                    data={processed}
                    keyExtractor={(item, idx) => item.id || item._id || String(idx)}
                    renderItem={({ item, index }) => (
                        <MechanicCard
                            item={item}
                            index={index}
                            dist={item._dist}
                            onProfile={() => navigation.navigate('MechanicProfile', { mechanic: item })}
                            onBook={() => navigation.navigate('MechanicProfile', { mechanic: item })}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Search size={48} color={COLORS.textLight} />
                            <Text style={styles.emptyTitle}>No mechanics found</Text>
                            <Text style={styles.emptyText}>Try adjusting your filters</Text>
                        </View>
                    }
                />
            )}

            {}
            <Modal visible={showSortModal} transparent animationType="slide" onRequestClose={() => setShowSortModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowSortModal(false)} />
                <View style={styles.sortSheet}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetTitle}>Sort Mechanics</Text>
                    {SORT_OPTIONS.map(opt => (
                        <TouchableOpacity
                            key={opt.key}
                            style={[styles.sortOption, sortKey === opt.key && styles.sortOptionActive]}
                            onPress={() => { setSortKey(opt.key); setShowSortModal(false); }}
                        >
                            <Text style={[styles.sortOptionText, sortKey === opt.key && { color: COLORS.primary, fontWeight: '800' }]}>
                                {opt.label}
                            </Text>
                            {sortKey === opt.key && <CheckCircle size={18} color={COLORS.primary} />}
                        </TouchableOpacity>
                    ))}
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    header: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingBottom: 12, ...SHADOWS.small },
    titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: SPACING.md, marginBottom: 14 },
    title: { fontSize: 26, fontWeight: '900', color: COLORS.text },
    subtitle: { fontSize: 13, color: COLORS.textLight, fontWeight: '600' },
    searchRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 12 },
    searchBar: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F0F2F5', paddingHorizontal: SPACING.md,
        borderRadius: 14, height: 48,
    },
    input: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.text },
    sortBtn: {
        width: 48, height: 48, borderRadius: 14,
        backgroundColor: '#FFF5E6', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#FFE0B3',
    },
    controlRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    sortChip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: COLORS.primary + '15', paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary + '30',
    },
    sortChipText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
    availToggle: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        backgroundColor: '#F0F2F5', borderWidth: 1, borderColor: '#E0E0E0',
    },
    availToggleActive: { backgroundColor: '#34C759', borderColor: '#34C759' },
    toggleDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#8E8E93' },
    toggleText: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
    filterScroll: { marginBottom: 4 },
    filterChip: {
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        backgroundColor: '#F0F2F5', marginRight: 8, borderWidth: 1, borderColor: '#E0E0E0',
    },
    filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterChipText: { fontSize: 13, fontWeight: '700', color: COLORS.textLight },

    list: { padding: 18, paddingBottom: 100 },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 22,
        padding: 22,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#F2F2F2',
        ...SHADOWS.small,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6,
    },
    cardName: {
        fontSize: 19,
        fontWeight: '700',
        color: COLORS.text,
        letterSpacing: -0.4,
    },
    eliteBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 2,
        borderWidth: 1,
        borderColor: '#D4AF3740',
    },
    eliteText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#B8860B',
        textTransform: 'uppercase',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 3,
    },
    verifiedText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.white,
        textTransform: 'uppercase',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
    },
    reviewText: {
        fontSize: 13,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    addressText: {
        fontSize: 13,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    trustRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    experienceTag: {
        backgroundColor: '#F0F4FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    experienceText: {
        fontSize: 11,
        color: COLORS.primary,
        fontWeight: '700',
    },
    specialtyTag: {
        backgroundColor: '#F7F8FA',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    specialtyText: {
        fontSize: 11,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFD',
        padding: 15,
        borderRadius: 16,
        marginBottom: 20,
    },
    infoItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },
    infoDivider: {
        width: 1,
        height: 20,
        backgroundColor: '#E5E5E5',
        marginHorizontal: 8,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    navBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
    },
    callBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F5F7FA',
        borderWidth: 1.2,
        borderColor: '#EAECEF',
    },
    callBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    bookBtn: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        ...SHADOWS.small,
    },
    bookBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.white,
    },
    bookBtnDisabled: {
        backgroundColor: '#D1D1D1',
    },

    emptyBox: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 14 },
    emptyText: { fontSize: 14, color: COLORS.textLight, marginTop: 6 },

    
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
    sortSheet: {
        backgroundColor: COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: SPACING.lg, paddingBottom: 36, ...SHADOWS.large,
    },
    sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#DDD', alignSelf: 'center', marginBottom: 20 },
    sheetTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text, marginBottom: 16 },
    sortOption: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    sortOptionActive: { backgroundColor: COLORS.primary + '08', borderRadius: 12, paddingHorizontal: 12 },
    sortOptionText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});

export default MechanicsScreen;
