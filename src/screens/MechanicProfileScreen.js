import { ArrowLeft, Award, CheckCircle, Clock, MapPin, Star, Wrench } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert, Image, KeyboardAvoidingView, Modal,
    Platform, ScrollView, StyleSheet, Text,
    TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { useLocation } from '../context/LocationContext';

const SERVICES = [
    { id: 'oil', label: '🛢  Oil Change', type: 'General Service' },
    { id: 'battery', label: '🔋 Battery Repair', type: 'Electrical' },
    { id: 'tyre', label: '🔄 Tyre Change', type: 'Tyre Change' },
    { id: 'engine', label: '⚙️  Engine Issue', type: 'Engine Repair' },
    { id: 'brake', label: '🛑 Brake Repair', type: 'Brakes' },
    { id: 'ac', label: '❄️  AC Service', type: 'AC Service' },
    { id: 'other', label: '🔧 Other', type: 'General Repair' },
];

const MechanicProfileScreen = ({ navigation, route }) => {
    const { mechanic } = route.params;
    const { placeOrder, addReview } = useAppContext();
    const { location } = useLocation();

    const [bookingLoading, setBookingLoading] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [issueDescription, setIssueDescription] = useState('');

    const [userRating, setUserRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

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

    const handleSubmitReview = async () => {
        if (!reviewComment.trim()) {
            Alert.alert('Error', 'Please enter a comment.');
            return;
        }
        setSubmittingReview(true);
        const success = await addReview(mechanic.id || mechanic._id, {
            rating: userRating,
            comment: reviewComment
        });
        setSubmittingReview(false);
        if (success) {
            Alert.alert('Success', 'Thank you for your review!');
            setReviewComment('');
            setUserRating(5);
        } else {
            Alert.alert('Error', 'Failed to submit review. Using mock data.');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Header Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1000&auto=format&fit=crop' }}
                        style={styles.coverImage}
                    />
                    <View style={styles.overlay} />
                    <SafeAreaView style={styles.headerSafe}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                            <ArrowLeft size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                {/* Profile Info */}
                <View style={styles.content}>
                    <View style={styles.mainInfo}>
                        <Text style={styles.name}>{mechanic.name}</Text>
                        <View style={styles.row}>
                            <Star size={18} color="#FFD700" fill="#FFD700" />
                            <Text style={styles.rating}>{mechanic.rating} ({mechanic.reviews?.length || 0} reviews)</Text>
                        </View>
                        <View style={styles.addressRow}>
                            <MapPin size={16} color={COLORS.textLight} />
                            <Text style={styles.address}>{mechanic.address}</Text>
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Award size={24} color={COLORS.primary} />
                            <Text style={styles.statValue}>{mechanic.experience || '5 Yrs'}</Text>
                            <Text style={styles.statLabel}>Exp</Text>
                        </View>
                        <View style={styles.statItem}>
                            <CheckCircle size={24} color={COLORS.success} />
                            <Text style={styles.statValue}>{mechanic.jobsCompleted || '100+'}</Text>
                            <Text style={styles.statLabel}>Jobs</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Clock size={24} color="#FF9500" />
                            <Text style={styles.statValue}>20 min</Text>
                            <Text style={styles.statLabel}>Arrival</Text>
                        </View>
                    </View>

                    {/* Specialties */}
                    <Text style={styles.sectionTitle}>Specialties</Text>
                    <View style={styles.tagsContainer}>
                        {mechanic.specialties?.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Wrench size={14} color={COLORS.primary} />
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Leave a Review */}
                    <View style={styles.leaveReviewCard}>
                        <Text style={styles.reviewTitle}>Rate your experience</Text>
                        <View style={styles.ratingSelector}>
                            {[1, 2, 3, 4, 5].map((num) => (
                                <TouchableOpacity key={num} onPress={() => setUserRating(num)}>
                                    <Star
                                        size={32}
                                        color={num <= userRating ? "#FFD700" : COLORS.gray}
                                        fill={num <= userRating ? "#FFD700" : "transparent"}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={styles.reviewInput}
                            placeholder="Share your feedback..."
                            placeholderTextColor={COLORS.textLight}
                            multiline
                            value={reviewComment}
                            onChangeText={setReviewComment}
                        />
                        <TouchableOpacity
                            style={[styles.submitReviewBtn, submittingReview && { opacity: 0.7 }]}
                            onPress={handleSubmitReview}
                            disabled={submittingReview}
                        >
                            <Text style={styles.submitReviewText}>
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Reviews */}
                    <Text style={styles.sectionTitle}>Customer Reviews</Text>
                    {mechanic.reviews?.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.reviewerAvatar}>
                                    <Text style={styles.reviewerInitials}>{(review.user || 'U').charAt(0)}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.reviewerName}>{review.user}</Text>
                                    <Text style={styles.reviewDate}>{review.date}</Text>
                                </View>
                                <View style={styles.miniRating}>
                                    <Star size={12} color="#FFD700" fill="#FFD700" />
                                    <Text style={styles.miniRatingText}>{review.rating}</Text>
                                </View>
                            </View>
                            <Text style={styles.reviewText}>{review.comment}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Sticky Bottom Button */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.costLabel}>Estimated Cost</Text>
                    <Text style={styles.costValue}>{mechanic.estimatedCost || 'Varies'}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.bookBtn, bookingLoading && { opacity: 0.6 }]}
                    onPress={handleBookNow}
                    disabled={bookingLoading}
                >
                    <Text style={styles.bookBtnText}>{bookingLoading ? '⏳ Booking...' : '🔧 Book Mechanic'}</Text>
                </TouchableOpacity>
            </View>

            {/* ── Service Picker Modal ───────────────────────── */}
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
                    <SafeAreaView style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>What do you need?</Text>
                        <Text style={styles.modalSub}>Select the service type</Text>

                        <View style={styles.serviceGrid}>
                            {SERVICES.map(svc => {
                                const isActive = selectedService?.id === svc.id;
                                return (
                                    <TouchableOpacity
                                        key={svc.id}
                                        style={[styles.serviceChip, isActive && styles.serviceChipActive]}
                                        onPress={() => setSelectedService(svc)}
                                    >
                                        <Text style={[styles.serviceChipText, isActive && { color: COLORS.white }]}>
                                            {svc.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={styles.descLabel}>Describe the issue (optional)</Text>
                        <TextInput
                            style={styles.descInput}
                            placeholder="e.g. Engine makes noise when starting..."
                            placeholderTextColor={COLORS.textLight}
                            value={issueDescription}
                            onChangeText={setIssueDescription}
                            multiline
                            numberOfLines={3}
                        />

                        <TouchableOpacity
                            style={[styles.confirmBtn, !selectedService && { opacity: 0.5 }]}
                            onPress={handleConfirmBooking}
                        >
                            <Text style={styles.confirmBtnText}>Confirm Booking 🚀</Text>
                        </TouchableOpacity>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    imageContainer: {
        height: 250,
        backgroundColor: COLORS.gray,
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    headerSafe: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.md,
        marginTop: 10,
    },
    content: {
        marginTop: -30,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: SPACING.xl,
    },
    mainInfo: {
        marginBottom: SPACING.xl,
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    rating: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    address: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderRadius: 20,
        ...SHADOWS.small,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginVertical: 4,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.md,
        marginTop: SPACING.md,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    tagText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 13,
    },
    reviewCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 16,
        marginBottom: SPACING.md,
        ...SHADOWS.small,
    },
    reviewHeader: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'center',
        gap: 10,
    },
    reviewerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewerInitials: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    reviewerName: {
        fontWeight: 'bold',
        color: COLORS.text,
        fontSize: 14,
    },
    reviewDate: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    miniRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF9E6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    miniRatingText: {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#B38B00',
    },
    reviewText: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 20,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        paddingBottom: 40,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        ...SHADOWS.large,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    costLabel: {
        fontSize: 13,
        color: COLORS.textLight,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 4,
        fontWeight: '700',
    },
    costValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1A1A1A',
        letterSpacing: -0.5,
    },
    bookBtn: {
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 32,
        paddingVertical: 18,
        borderRadius: 16,
        ...SHADOWS.large,
        elevation: 8,
    },
    bookBtnText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    leaveReviewCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SPACING.lg,
        marginTop: SPACING.xl,
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    reviewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    ratingSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: SPACING.lg,
    },
    reviewInput: {
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: SPACING.md,
        height: 100,
        textAlignVertical: 'top',
        fontSize: 14,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        marginBottom: SPACING.md,
    },
    submitReviewBtn: {
        backgroundColor: COLORS.primary + '15',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitReviewText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 15,
    },
    // ── Service Picker Modal ─────────────────────────────────────────────────
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    modalDismiss: { flex: 1 },
    modalSheet: {
        backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: SPACING.lg, paddingBottom: SPACING.xl,
        ...SHADOWS.large,
    },
    modalHandle: { width: 44, height: 4, borderRadius: 2, backgroundColor: '#DDD', alignSelf: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text, textAlign: 'center' },
    modalSub: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginBottom: 20 },
    serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    serviceChip: {
        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
        backgroundColor: '#F0F2F5', borderWidth: 1.5, borderColor: 'transparent',
    },
    serviceChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    serviceChipText: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    descLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
    descInput: {
        backgroundColor: '#F7F8FA', borderRadius: 14, padding: 14,
        fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: '#E0E0E0',
        minHeight: 80, textAlignVertical: 'top', marginBottom: 20,
    },
    confirmBtn: {
        backgroundColor: COLORS.primary, borderRadius: 18, paddingVertical: 18,
        alignItems: 'center', ...SHADOWS.medium,
    },
    confirmBtnText: { fontSize: 17, fontWeight: '900', color: COLORS.white },
});

export default MechanicProfileScreen;
