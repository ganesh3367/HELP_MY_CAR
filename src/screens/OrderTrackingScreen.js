import { useRoute } from '@react-navigation/native';
import { CheckCircle, Clock, MapPin, MessageSquare, Phone } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';

const OrderTrackingScreen = () => {
    const { params } = useRoute();
    const { trackOrderStatus, currentOrder } = useAppContext();
    const [orderStatus, setOrderStatus] = useState(params?.order || currentOrder);

    useEffect(() => {
        const fetchStatus = async () => {
            // In a real app you'd use the ID from params
            const orderId = orderStatus?._id || params?.order?._id;
            if (orderId) {
                const updatedOrder = await trackOrderStatus(orderId);
                if (updatedOrder) {
                    setOrderStatus(updatedOrder);
                }
            }
        };

        // Initial fetch
        fetchStatus();

        // Poll every 3 seconds for updates
        const interval = setInterval(fetchStatus, 3000);


        return () => clearInterval(interval);
    }, [orderStatus?._id, params?.order?._id, trackOrderStatus]);

    // Helper to get status color/text
    const getStatusInfo = (status) => {
        switch (status) {
            case 'PENDING': return { color: '#FFA500', text: 'Finding a Mechanic...', icon: Clock };
            case 'ACCEPTED': return { color: '#007AFF', text: 'Order Accepted', icon: CheckCircle };
            case 'ON_THE_WAY': return { color: '#34C759', text: 'Mechanic on the way', icon: MapPin };
            case 'ARRIVED': return { color: '#5856D6', text: 'Mechanic Arrived', icon: CheckCircle };
            case 'COMPLETED': return { color: '#8E8E93', text: 'Service Completed', icon: CheckCircle };
            default: return { color: COLORS.text, text: status, icon: Clock };
        }
    };

    const statusInfo = getStatusInfo(orderStatus?.status);
    const StatusIcon = statusInfo.icon;

    // Ensure locations exist before rendering map
    const isValidLocation = orderStatus?.userLocation?.lat && orderStatus?.mechanicLocation?.lat;

    if (!orderStatus) return (
        <SafeAreaView style={styles.container}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mapContainer}>
                {isValidLocation ? (
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        region={{
                            latitude: (orderStatus.userLocation.lat + orderStatus.mechanicLocation.lat) / 2,
                            longitude: (orderStatus.userLocation.lng + orderStatus.mechanicLocation.lng) / 2,
                            latitudeDelta: Math.abs(orderStatus.userLocation.lat - orderStatus.mechanicLocation.lat) * 2 + 0.005,
                            longitudeDelta: Math.abs(orderStatus.userLocation.lng - orderStatus.mechanicLocation.lng) * 2 + 0.005,
                        }}
                    >
                        {/* User Marker */}
                        <Marker
                            coordinate={{ latitude: orderStatus.userLocation.lat, longitude: orderStatus.userLocation.lng }}
                            title="You"
                        >
                            <View style={styles.userMarker}>
                                <View style={styles.userMarkerDot} />
                            </View>
                        </Marker>

                        {/* Mechanic Marker */}
                        <Marker
                            coordinate={{ latitude: orderStatus.mechanicLocation.lat, longitude: orderStatus.mechanicLocation.lng }}
                            title="Mechanic"
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={styles.mechanicMarker}>
                                <StatusIcon size={20} color={COLORS.white} />
                            </View>
                        </Marker>
                    </MapView>
                ) : (
                    <View style={styles.mapPlaceholder}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text style={{ marginTop: 10, color: COLORS.textLight }}>Loading Map...</Text>
                    </View>
                )}

                {/* Status Overlay */}
                <View style={styles.statusOverlay}>
                    <View style={[styles.statusPill, { backgroundColor: statusInfo.color + '20' }]}>
                        <StatusIcon size={16} color={statusInfo.color} />
                        <Text style={[styles.statusPillText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.card}>
                {/* Driver Info */}
                <View style={styles.driverSection}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=200&auto=format&fit=crop' }}
                        style={styles.avatar}
                    />
                    <View style={styles.driverInfo}>
                        <Text style={styles.mechanicLabel}>Your Mechanic</Text>
                        <Text style={styles.garageName}>{orderStatus.garageId?.name || 'Mechanic'}</Text>
                        <View style={styles.ratingRow}>
                            <Text style={styles.ratingText}>★ 4.8</Text>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.vehicleText}>
                                {orderStatus.vehicleDetails?.make} {orderStatus.vehicleDetails?.model}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.timeBadge}>
                        <Text style={styles.timeText}>15 min</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Progress Bar (Visual only for now) */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: orderStatus.status === 'ARRIVED' ? '100%' : '50%', backgroundColor: statusInfo.color }]} />
                </View>
                <Text style={styles.progressText}>
                    {orderStatus.status === 'ARRIVED' ? 'Mechanic has arrived!' : 'Arriving in approximately 15 minutes'}
                </Text>


                <View style={styles.actions}>
                    {orderStatus.status === 'ARRIVED' ? (
                        <View style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}>
                            <CheckCircle size={24} color={COLORS.white} />
                            <Text style={[styles.actionText, { color: COLORS.white }]}>Complete Job</Text>
                        </View>
                    ) : (
                        <>
                            <View style={[styles.actionBtn, { backgroundColor: '#E5F1FF' }]}>
                                <Phone size={24} color={COLORS.primary} />
                                <Text style={[styles.actionText, { color: COLORS.primary }]}>Call</Text>
                            </View>
                            <View style={[styles.actionBtn, { backgroundColor: '#E8F8EE' }]}>
                                <MessageSquare size={24} color="#34C759" />
                                <Text style={[styles.actionText, { color: '#34C759' }]}>Message</Text>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    mapContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    mapPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0'
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    userMarker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 122, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userMarkerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#007AFF',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    mechanicMarker: {
        backgroundColor: COLORS.primary,
        padding: 8,
        borderRadius: 20,
        ...SHADOWS.medium,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    card: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: SPACING.xl,
        ...SHADOWS.large,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    statusOverlay: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        zIndex: 10,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
        ...SHADOWS.medium,
        backgroundColor: COLORS.white, // Fallback if translucent bg fails
        borderWidth: 1,
        borderColor: COLORS.white,
    },
    statusPillText: {
        fontSize: 14,
        fontWeight: '700',
    },
    driverSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    mechanicLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 2,
    },
    driverInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    dot: {
        marginHorizontal: 6,
        color: COLORS.textLight,
    },
    timeBadge: {
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    timeText: {
        fontWeight: '700',
        color: COLORS.text,
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#F2F2F7',
        marginBottom: SPACING.xl,
    },
    progressContainer: {
        height: 6,
        backgroundColor: '#F2F2F7',
        borderRadius: 3,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 13,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
    }
});

export default OrderTrackingScreen;
