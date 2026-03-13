import { ArrowLeft, Award, CheckCircle, Clock, MapPin, Star, Wrench } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert, Animated, Dimensions, Image, KeyboardAvoidingView, Modal,
    Platform, ScrollView, StyleSheet, Text,
    TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { useLocation } from '../context/LocationContext';

import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const SERVICES = [
    { id: 'oil', label: 'Oil Change', type: 'General Service' },
    { id: 'battery', label: 'Battery Repair', type: 'Electrical' },
    { id: 'tyre', label: 'Tyre Change', type: 'Tyre Change' },
    { id: 'engine', label: 'Engine Issue', type: 'Engine Repair' },
    { id: 'brake', label: 'Brake Repair', type: 'Brakes' },
    { id: 'ac', label: 'AC Service', type: 'AC Service' },
    { id: 'other', label: 'Other', type: 'General Repair' },
];

const MechanicProfileScreen = ({ navigation, route }) => {
    const { mechanic } = route.params;
    const { placeOrder } = useAppContext();
    const { location } = useLocation();

    const [bookingLoading, setBookingLoading] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [issueDescription, setIssueDescription] = useState('');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }, []);

    // Open service picker modal
    const handleBookNow = () => setShowServiceModal(true);

    // Confirm booking after service selected
    const handleConfirmBooking = async () => {
        if (!selectedService) {
            Alert.alert('Select a service', 'Please choose the type of service you need.');
            return;
        }
        setShowServiceModal(false);
        setBookingLoading(true);

        const userLat = location?.coords?.latitude || 18.5204;
        const userLng = location?.coords?.longitude || 73.8567;

        const vehicleDetails = {
            make: 'My Car',
            model: 'Vehicle',
            year: String(new Date().getFullYear()),
            issue: issueDescription.trim() || selectedService.type,
            serviceType: selectedService.type,
        };

        const order = await placeOrder(mechanic.id || mechanic._id, vehicleDetails, {
            lat: userLat, lng: userLng,
        });
        setBookingLoading(false);

        if (order) {
            navigation.navigate('OrderTracking', { order });
        } else {
            Alert.alert('Booking Failed', 'Could not place order. Please try again.');
        }
    };

    const headerTranslate = scrollY.interpolate({
        inputRange: [0, 250],
        outputRange: [0, -50],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            <Animated.ScrollView
                contentContainerStyle={{ paddingBottom: 150 }}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
                scrollEventThrottle={16}
            >
                {/* Header Image Section */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1000&auto=format&fit=crop' }}
                        style={styles.coverImage}
                    />
                    <View style={styles.gradientOverlay} />

                    <SafeAreaView style={styles.headerSafe}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                            <BlurView intensity={30} style={styles.blurBack}>
                                <ArrowLeft size={22} color={COLORS.white} />
                            </BlurView>
                        </TouchableOpacity>
                    </SafeAreaView>

                    <Animated.View style={[styles.titleOverlay, { opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }]}>
                        <View style={styles.eliteRow}>
                            <Award size={14} color="#FFD700" />
                            <Text style={styles.eliteText}>Verified Expert</Text>
                        </View>
                        <Text style={styles.nameOverlay}>{mechanic.name}</Text>
                        <View style={styles.headerRating}>
                            <Star size={16} color="#FFD700" fill="#FFD700" />
                            <Text style={styles.headerRatingText}>{mechanic.rating || 4.8} / 5.0</Text>
                            <View style={styles.dot} />
                            <Text style={styles.headerRatingText}>{mechanic.reviewCount || 120}+ Jobs</Text>
                        </View>
                    </Animated.View>
                </View>

                {/* Main Content Area */}
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    {/* Trust Badges */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <View style={[styles.statIconBox, { backgroundColor: '#F0F4FF' }]}>
                                <Award size={20} color={COLORS.primary} />
                            </View>
                            <Text style={styles.statValue}>{mechanic.experience || '8+ Yrs'}</Text>
                            <Text style={styles.statLabel}>Exp</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={[styles.statIconBox, { backgroundColor: '#EFFFF4' }]}>
                                <CheckCircle size={20} color={COLORS.success} />
                            </View>
                            <Text style={styles.statValue}>{mechanic.jobsCompleted || '450'}</Text>
                            <Text style={styles.statLabel}>Success</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={[styles.statIconBox, { backgroundColor: '#FFF9E6' }]}>
                                <Clock size={20} color="#FFB800" />
                            </View>
                            <Text style={styles.statValue}>~15m</Text>
                            <Text style={styles.statLabel}>Arrival</Text>
                        </View>
                    </View>

                    {/* Description Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>About Mechanic</Text>
                        <View style={styles.line} />
                    </View>
                    <Text style={styles.descriptionText}>
                        Expert diagnostic and repair services delivered at your location. Specialized in modern vehicle systems with high-quality parts and guaranteed satisfaction.
                    </Text>

                    {/* About/Specialties */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Specialties</Text>
                        <View style={styles.line} />
                    </View>
                    <View style={styles.tagsContainer}>
                        {(mechanic.specialties || ['Engine', 'Electrical', 'Brakes']).map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Wrench size={12} color={COLORS.primary} />
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <MapPin size={20} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoTitle}>Service Location</Text>
                                <Text style={styles.infoSub} numberOfLines={2}>{mechanic.address}</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Clock size={20} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoTitle}>Operational Status</Text>
                                <Text style={styles.infoSub}>Available 24/7 for Emergency Support</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </Animated.ScrollView>

            {/* Premium Sticky Bottom Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.bookBtn, bookingLoading && { opacity: 0.6 }]}
                    onPress={handleBookNow}
                    disabled={bookingLoading}
                >
                    <Text style={styles.bookBtnText}>{bookingLoading ? 'Processing...' : 'Book Service'}</Text>
                    <ArrowLeft size={18} color={COLORS.white} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
            </View>

            {/* ── Service Picker Modal (Redesigned) ───────────────────────── */}
            <Modal
                visible={showServiceModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowServiceModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <TouchableOpacity style={styles.modalDismiss} onPress={() => setShowServiceModal(false)} />
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Select Service</Text>
                        <Text style={styles.modalSub}>Pick what you need for {mechanic.name}</Text>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                            <View style={styles.serviceGrid}>
                                {SERVICES.map(svc => {
                                    const isActive = selectedService?.id === svc.id;
                                    return (
                                        <TouchableOpacity
                                            key={svc.id}
                                            style={[styles.serviceOption, isActive && styles.serviceOptionActive]}
                                            onPress={() => setSelectedService(svc)}
                                        >
                                            <Text style={[styles.serviceText, isActive && { color: COLORS.white }]}>
                                                {svc.label}
                                            </Text>
                                            {isActive && (
                                                <View style={styles.checkIcon}>
                                                    <CheckCircle size={14} color={COLORS.white} />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text style={styles.descLabel}>Additional Details</Text>
                            <TextInput
                                style={styles.descInput}
                                placeholder=""
                                placeholderTextColor={COLORS.textLight}
                                value={issueDescription}
                                onChangeText={setIssueDescription}
                                multiline
                                numberOfLines={3}
                            />
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.confirmBtn, !selectedService && { opacity: 0.5 }]}
                            onPress={handleConfirmBooking}
                            disabled={!selectedService}
                        >
                            <Text style={styles.confirmBtnText}>Confirm Order</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    imageContainer: { height: 300, backgroundColor: '#000' },
    coverImage: { width: '100%', height: '100%', opacity: 0.85 },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    headerSafe: { position: 'absolute', top: 0, left: 0, zIndex: 10 },
    blurBack: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    backBtn: { marginLeft: 20, marginTop: Platform.OS === 'ios' ? 0 : 10 },
    titleOverlay: { position: 'absolute', bottom: 40, left: 24, right: 24 },
    eliteRow: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10,
        paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start',
        marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    },
    eliteText: { fontSize: 11, fontWeight: '900', color: COLORS.white, textTransform: 'uppercase', letterSpacing: 0.5 },
    nameOverlay: { fontSize: 32, fontWeight: '900', color: COLORS.white, marginBottom: 8, letterSpacing: -0.5 },
    headerRating: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerRatingText: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)' },

    content: {
        marginTop: -30, backgroundColor: '#F8F9FB', borderTopLeftRadius: 35,
        borderTopRightRadius: 35, padding: 24,
    },
    statsGrid: {
        flexDirection: 'row', justifyContent: 'space-between',
        backgroundColor: COLORS.white, borderRadius: 24, padding: 20,
        marginBottom: 30, ...SHADOWS.small,
    },
    statItem: { alignItems: 'center', flex: 1 },
    statIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    statValue: { fontSize: 16, fontWeight: '900', color: COLORS.text, marginBottom: 2 },
    statLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 10 },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text, letterSpacing: -0.3 },
    line: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },

    descriptionText: { fontSize: 14, color: '#64748B', lineHeight: 22, fontWeight: '500', marginBottom: 20 },

    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
    tag: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', ...SHADOWS.small,
    },
    tagText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

    infoCard: {
        backgroundColor: COLORS.white, borderRadius: 24, padding: 20,
        marginBottom: 30, ...SHADOWS.small, gap: 20,
    },
    infoRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
    infoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primary + '10', alignItems: 'center', justifyContent: 'center' },
    infoTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
    infoSub: { fontSize: 13, color: '#64748B', fontWeight: '500' },

    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: COLORS.white, padding: 20, paddingBottom: 35,
        flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9',
        justifyContent: 'space-between', ...SHADOWS.large,
    },
    bookBtn: {
        flex: 1, backgroundColor: COLORS.primary, height: 60,
        borderRadius: 20, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 10, ...SHADOWS.medium,
    },
    bookBtnText: { fontSize: 17, fontWeight: '900', color: COLORS.white },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalDismiss: { flex: 1 },
    modalSheet: {
        backgroundColor: COLORS.white, borderTopLeftRadius: 35, borderTopRightRadius: 35,
        padding: 24, paddingBottom: 40,
    },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 6 },
    modalSub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, fontWeight: '500' },
    serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    serviceOption: {
        width: (width - 60) / 2, backgroundColor: '#F8FAFC', borderRadius: 20,
        padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#F1F5F9',
    },
    serviceOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    serviceIcon: { fontSize: 24 },
    serviceText: { fontSize: 13, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
    checkIcon: { position: 'absolute', top: 10, right: 10 },
    descLabel: { fontSize: 15, fontWeight: '900', color: COLORS.text, marginBottom: 12 },
    descInput: {
        backgroundColor: '#F8FAFC', borderRadius: 20, padding: 16,
        fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: '#F1F5F9',
        minHeight: 100, textAlignVertical: 'top', marginBottom: 24,
    },
    confirmBtn: {
        backgroundColor: COLORS.primary, borderRadius: 20, height: 64,
        alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium,
    },
    confirmBtnText: { fontSize: 18, fontWeight: '900', color: COLORS.white },
});

export default MechanicProfileScreen;
