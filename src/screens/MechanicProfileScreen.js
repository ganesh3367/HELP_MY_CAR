import { ArrowLeft, Award, CheckCircle, Clock, MapPin, Star, Wrench } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

const MechanicProfileScreen = ({ navigation, route }) => {
    const { mechanic } = route.params;
    const { placeOrder } = useAppContext();
    const [bookingLoading, setBookingLoading] = useState(false);

    const handleBookNow = async () => {
        setBookingLoading(true);
        // Direct booking flow for now - in future stages this could go to a "Select Service" screen
        const order = await placeOrder(mechanic._id, { make: 'Toyota', model: 'Camry' }); // Demo vehicle
        setBookingLoading(false);
        if (order) {
            navigation.navigate('OrderTracking', { order });
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

                    {/* Reviews */}
                    <Text style={styles.sectionTitle}>Customer Reviews</Text>
                    {mechanic.reviews?.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.reviewerAvatar}>
                                    <Text style={styles.reviewerInitials}>{review.user.charAt(0)}</Text>
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
                    <Text style={styles.costValue}>{mechanic.estimatedCost}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.bookBtn, bookingLoading && { opacity: 0.6 }]}
                    onPress={handleBookNow}
                    disabled={bookingLoading}
                >
                    <Text style={styles.bookBtnText}>{bookingLoading ? 'Booking...' : 'Book Now'}</Text>
                </TouchableOpacity>
            </View>
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
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 2,
    },
    costValue: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.primary,
    },
    bookBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 16,
        borderRadius: 16,
        ...SHADOWS.medium,
    },
    bookBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MechanicProfileScreen;
