import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { AlertCircle, CheckCircle, ChevronRight, Clock, MapPin, Phone, XCircle } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import socket, { connectSocket, joinOrder } from '../services/socket';

const GarageOrdersScreen = () => {
    const navigation = useNavigation();
    const { myGarage, garageOrders, fetchGarageOrders, updateOrderStatus } = useAppContext();
    const [loading, setLoading] = useState(false);
    const locationSubscription = useRef(null);

    useEffect(() => {
        if (myGarage?.id) {
            loadOrders();
        }
    }, [myGarage?.id]);

    useEffect(() => {
        
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        await fetchGarageOrders(myGarage.id);
        setLoading(false);
    };

    const startLocationTracking = async (orderId) => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Location permission is required for tracking.');
                return;
            }

            connectSocket();
            joinOrder(orderId);

            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 10, 
                    timeInterval: 5000,    
                },
                (location) => {
                    const coords = {
                        lat: location.coords.latitude,
                        lng: location.coords.longitude
                    };
                    console.log('Sending location update:', coords);
                    socket.emit('update_location', { orderId, location: coords });
                }
            );
        } catch (error) {
            console.error('Tracking Error:', error);
        }
    };

    const stopLocationTracking = () => {
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
    };

    const handleStatusUpdate = async (order, newStatus) => {
        const success = await updateOrderStatus(order.id || order._id, newStatus);
        if (success) {
            if (newStatus === 'ON_THE_WAY') {
                startLocationTracking(order.id || order._id);
            } else if (newStatus === 'ARRIVED' || newStatus === 'COMPLETED') {
                stopLocationTracking();
            }

            if (newStatus === 'ACCEPTED') {
                navigation.navigate('GarageOrderTracking', { order: { ...order, status: newStatus } });
            } else {
                Alert.alert('Success', `Order status updated to ${newStatus}`);
            }
        } else {
            Alert.alert('Error', 'Failed to update status. Please try again.');
        }
    };

    const renderOrderItem = ({ item }) => {
        const isPending = item.status === 'PENDING';

        return (
            <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <View style={styles.vehicleInfo}>
                        <Text style={styles.vehicleName}>{item.vehicleDetails.make} {item.vehicleDetails.model} ({item.vehicleDetails.year})</Text>
                        <Text style={styles.orderId}>ID: {item.id.substring(0, 8)}...</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <AlertCircle size={16} color={COLORS.error} />
                    <Text style={styles.issueText}>{item.vehicleDetails.issue}</Text>
                </View>

                <View style={styles.detailRow}>
                    <MapPin size={16} color={COLORS.textLight} />
                    <Text style={styles.locationText}>View Location on Map</Text>
                </View>

                <View style={styles.actionRow}>
                    {isPending ? (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.rejectButton]}
                                onPress={() => handleStatusUpdate(item, 'REJECTED')}
                            >
                                <XCircle size={18} color={COLORS.error} />
                                <Text style={styles.rejectText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.acceptButton]}
                                onPress={() => handleStatusUpdate(item, 'ACCEPTED')}
                            >
                                <CheckCircle size={18} color={COLORS.white} />
                                <Text style={styles.acceptText}>Accept</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={styles.trackingHint}
                            onPress={() => navigation.navigate('GarageOrderTracking', { order: item })}
                        >
                            <Text style={styles.trackingHintText}>Tap to view tracking & details</Text>
                            <ChevronRight size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                    )}
                </View>

                {item.status !== 'PENDING' && item.status !== 'REJECTED' && item.status !== 'COMPLETED' && (
                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => Linking.openURL('tel:+911234567890')} 
                    >
                        <Phone size={16} color={COLORS.primary} />
                        <Text style={styles.callText}>Contact Customer</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderNextStatusAction = (order) => {
        let nextStatus = '';
        let buttonLabel = '';
        let buttonColor = COLORS.primary;

        if (order.status === 'ACCEPTED') {
            nextStatus = 'ON_THE_WAY';
            buttonLabel = 'Mark On The Way';
        } else if (order.status === 'ON_THE_WAY') {
            nextStatus = 'ARRIVED';
            buttonLabel = 'Mark Arrived';
        } else if (order.status === 'ARRIVED') {
            nextStatus = 'IN_PROGRESS';
            buttonLabel = 'Start Work';
        } else if (order.status === 'IN_PROGRESS') {
            nextStatus = 'COMPLETED';
            buttonLabel = 'Complete Job';
            buttonColor = COLORS.success;
        } else {
            return null;
        }

        return (
            <TouchableOpacity
                style={[styles.fullActionButton, { backgroundColor: buttonColor }]}
                onPress={() => handleStatusUpdate(order.id, nextStatus)}
            >
                <Text style={styles.fullActionButtonText}>{buttonLabel}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Order Management</Text>
                <TouchableOpacity onPress={loadOrders}>
                    <Clock size={22} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : garageOrders.length > 0 ? (
                <FlatList
                    data={garageOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.center}>
                    <AlertCircle size={48} color={COLORS.textLight} />
                    <Text style={styles.emptyText}>No service requests found.</Text>
                </View>
            )}
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
        case 'COMPLETED': return COLORS.success;
        case 'REJECTED': return COLORS.error;
        default: return COLORS.textLight;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    list: {
        padding: SPACING.md,
        paddingBottom: 100,
    },
    orderCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    orderId: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: SPACING.md,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    issueText: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '500',
    },
    locationText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: SPACING.md,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    rejectButton: {
        borderColor: COLORS.error,
        backgroundColor: '#FFF1F0',
    },
    rejectText: {
        color: COLORS.error,
        fontWeight: 'bold',
    },
    acceptButton: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },
    acceptText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    fullActionButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        ...SHADOWS.small,
    },
    fullActionButtonText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: 'bold',
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    callText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textLight,
        marginTop: 15,
        textAlign: 'center',
    },
    trackingHint: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        backgroundColor: COLORS.primary + '10',
        borderRadius: 12,
    },
    trackingHintText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default GarageOrdersScreen;
