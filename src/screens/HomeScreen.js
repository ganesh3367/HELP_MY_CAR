import NetInfo from '@react-native-community/netinfo';
import { BookOpen, Flame, MapPin, Phone, Search, ShieldAlert, Siren, Truck, Wrench, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Linking,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import SOSButton from '../components/SOSButton';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const { location } = useLocation();
    const { mechanics } = useAppContext();
    const { user } = useAuth();
    const [mapError, setMapError] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isEmergencyModalVisible, setIsEmergencyModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });
        return () => unsubscribe();
    }, []);

    const initialRegion = {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    return (
        <View style={styles.container}>
            {!mapError ? (
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={location?.coords ? {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.0121,
                    } : initialRegion}
                    showsUserLocation
                    showsMyLocationButton={false}
                    onError={() => setMapError(true)}
                >
                    {mechanics.map((mechanic, index) => (
                        <Marker
                            key={mechanic._id || mechanic.id || index}
                            coordinate={{ latitude: mechanic.lat, longitude: mechanic.lng }}
                            title={mechanic.name}
                        >
                            <View style={styles.markerContainer}>
                                <View style={styles.markerIcon}>
                                    <Wrench size={14} color={COLORS.white} />
                                </View>
                            </View>
                        </Marker>
                    ))}
                </MapView>
            ) : (
                <View style={[styles.map, styles.fallbackContainer]}>
                    <MapPin size={48} color={COLORS.primary} />
                    <Text style={styles.fallbackTitle}>Map Unavailable</Text>
                    <Text style={styles.fallbackText}>Nearby services are listed in the tabs below.</Text>
                </View>
            )}

            <View style={styles.overlay} pointerEvents="box-none">
                <View style={styles.glassHeader}>
                    <View style={styles.topBar}>
                        {isSearchVisible ? (
                            <View style={styles.searchContainer}>
                                <Search size={20} color={COLORS.textLight} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search mechanics, towing..."
                                    placeholderTextColor={COLORS.textLight}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    autoFocus
                                />
                                <TouchableOpacity onPress={() => { setIsSearchVisible(false); setSearchQuery(''); }}>
                                    <X size={20} color={COLORS.textLight} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity style={styles.glassButton} onPress={() => setIsSearchVisible(true)}>
                                    <Search size={22} color={COLORS.text} />
                                </TouchableOpacity>

                                <View style={styles.mainGreeting}>
                                    <Text style={styles.greetingTitle}>Hello, {user?.name || 'Ganesh'}</Text>
                                    <View style={[styles.statusBadge, !isConnected && styles.offlineBadge]}>
                                        <View style={[styles.pulseDot, !isConnected && styles.offlineDot]} />
                                        <Text style={[styles.statusText, !isConnected && styles.offlineText]}>
                                            {isConnected ? 'Safe & Connected' : 'Offline Mode'}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.avatarButton}
                                    onPress={() => navigation.navigate('Profile')}
                                >
                                    <View style={styles.avatarLarge}>
                                        <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'G'}</Text>
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>

                {!isConnected && (
                    <View style={styles.emergencyContainer}>
                        <View style={styles.emergencyCard}>
                            <View style={styles.emergencyHeader}>
                                <ShieldAlert size={20} color={COLORS.error} />
                                <Text style={styles.emergencyTitle}>Offline Emergency Support</Text>
                            </View>
                            <Text style={styles.emergencySub}>Quick call even without internet</Text>

                            <View style={styles.emergencyRow}>
                                <TouchableOpacity style={styles.emergencyItem}>
                                    <View style={[styles.eIcon, { backgroundColor: '#FFEDED' }]}>
                                        <Phone size={18} color={COLORS.error} />
                                    </View>
                                    <Text style={styles.eLabel}>Police (100)</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.emergencyItem}>
                                    <View style={[styles.eIcon, { backgroundColor: '#E6F3FF' }]}>
                                        <Phone size={18} color="#007AFF" />
                                    </View>
                                    <Text style={styles.eLabel}>Ambulance (102)</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.bottomContent}>


                    <View style={styles.glassCard}>
                        <View style={styles.actionHeader}>
                            <Text style={styles.cardTitle}>Emergency Services</Text>
                            <View style={styles.activePill}>
                                <Text style={styles.activePillText}>Live</Text>
                            </View>
                        </View>

                        <View style={styles.actionGrid}>
                            <TouchableOpacity
                                style={[styles.actionCard, { backgroundColor: '#FFF7F0' }]}
                                onPress={() => navigation.navigate('Mechanics')}
                            >
                                <View style={[styles.actionIconPill, { backgroundColor: COLORS.primary }]}>
                                    <Wrench size={20} color={COLORS.white} />
                                </View>
                                <Text style={styles.actionLabel}>Mechanics</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionCard, { backgroundColor: '#F0F7FF' }]}
                                onPress={() => navigation.navigate('Towing')}
                            >
                                <View style={[styles.actionIconPill, { backgroundColor: '#007AFF' }]}>
                                    <Truck size={20} color={COLORS.white} />
                                </View>
                                <Text style={styles.actionLabel}>Towing</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionCard, { backgroundColor: '#F0FFF4' }]}
                                onPress={() => navigation.navigate('CarStuck')}
                            >
                                <View style={[styles.actionIconPill, { backgroundColor: '#34C759' }]}>
                                    <BookOpen size={20} color={COLORS.white} />
                                </View>
                                <Text style={styles.actionLabel}>Guides</Text>
                            </TouchableOpacity>


                        </View>
                    </View>
                </View>



                <SOSButton onPress={() => setIsEmergencyModalVisible(true)} />

                <Modal
                    visible={isEmergencyModalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setIsEmergencyModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity
                            style={styles.modalDismissArea}
                            onPress={() => setIsEmergencyModalVisible(false)}
                        />
                        <View style={styles.emergencyModal}>
                            <View style={styles.modalIndicator} />
                            <Text style={styles.modalTitle}>Emergency Assistance</Text>
                            <Text style={styles.modalSubtitle}>Select a service to get help immediately</Text>

                            <View style={styles.emergencyGrid}>
                                <TouchableOpacity
                                    style={[styles.emergencyButton, { backgroundColor: '#FFEDED' }]}
                                    onPress={() => { Linking.openURL('tel:100'); setIsEmergencyModalVisible(false); }}
                                >
                                    <View style={[styles.emergencyIcon, { backgroundColor: '#FF3B30' }]}>
                                        <Siren size={24} color={COLORS.white} />
                                    </View>
                                    <Text style={styles.emergencyLabel}>Police</Text>
                                    <Text style={styles.emergencyNumber}>100</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.emergencyButton, { backgroundColor: '#EBF5FF' }]}
                                    onPress={() => { Linking.openURL('tel:102'); setIsEmergencyModalVisible(false); }}
                                >
                                    <View style={[styles.emergencyIcon, { backgroundColor: '#007AFF' }]}>
                                        <ShieldAlert size={24} color={COLORS.white} />
                                    </View>
                                    <Text style={styles.emergencyLabel}>Ambulance</Text>
                                    <Text style={styles.emergencyNumber}>102</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.emergencyButton, { backgroundColor: '#FFF5E6' }]}
                                    onPress={() => { Linking.openURL('tel:101'); setIsEmergencyModalVisible(false); }}
                                >
                                    <View style={[styles.emergencyIcon, { backgroundColor: '#FF8C00' }]}>
                                        <Flame size={24} color={COLORS.white} />
                                    </View>
                                    <Text style={styles.emergencyLabel}>Fire</Text>
                                    <Text style={styles.emergencyNumber}>101</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.emergencyButton, { backgroundColor: '#F0F7FF' }]}
                                    onPress={() => { navigation.navigate('Towing'); setIsEmergencyModalVisible(false); }}
                                >
                                    <View style={[styles.emergencyIcon, { backgroundColor: COLORS.primary }]}>
                                        <Truck size={24} color={COLORS.white} />
                                    </View>
                                    <Text style={styles.emergencyLabel}>Roadside</Text>
                                    <Text style={styles.emergencyNumber}>24/7</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setIsEmergencyModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    overlay: {
        flex: 1,
    },
    glassHeader: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        paddingBottom: SPACING.md,
        marginHorizontal: 15,
        marginTop: Platform.OS === 'ios' ? 50 : 30,
        borderRadius: 30,
        ...SHADOWS.large,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.md,
    },
    offlineBadge: {
        backgroundColor: '#FFF1F0',
        borderColor: '#FFA39E',
    },
    offlineDot: {
        backgroundColor: COLORS.error,
    },
    offlineText: {
        color: COLORS.error,
    },
    emergencyContainer: {
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
    },
    emergencyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SPACING.md,
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: '#FFEBEA',
    },
    emergencyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    emergencyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    emergencySub: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
        marginBottom: SPACING.md,
    },
    emergencyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    emergencyItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    eIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    eLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.text,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 15,
        marginHorizontal: 5,
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
        marginLeft: 10,
        fontWeight: '600',
    },
    glassButton: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    mainGreeting: {
        alignItems: 'center',
        flex: 1,
    },
    greetingTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6F7ED',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#B7EB8F',
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.success,
        marginRight: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.success,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    avatarButton: {
        ...SHADOWS.medium,
    },
    avatarLarge: {
        width: 45,
        height: 45,
        borderRadius: 15,
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
    bottomContent: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.lg,
        paddingBottom: 80,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 24,
        padding: SPACING.lg,
        ...SHADOWS.medium,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    actionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    activePill: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activePillText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.primary,
        textTransform: 'uppercase',
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    actionCard: {
        flex: 1,
        padding: 12,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    actionIconPill: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        ...SHADOWS.small,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.text,
    },
    markerContainer: {
        padding: 2,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        ...SHADOWS.medium,
    },
    markerIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fallbackContainer: {
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fallbackTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 10,
    },
    fallbackText: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        paddingHorizontal: 40,
        marginTop: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalDismissArea: {
        flex: 1,
    },
    emergencyModal: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        padding: SPACING.xl,
        alignItems: 'center',
        ...SHADOWS.large,
    },
    modalIndicator: {
        width: 40,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 30,
        textAlign: 'center',
    },
    emergencyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        justifyContent: 'center',
        marginBottom: 30,
    },
    emergencyButton: {
        width: (width - 60) / 2 - 10,
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emergencyIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        ...SHADOWS.small,
    },
    emergencyLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.text,
    },
    emergencyNumber: {
        fontSize: 12,
        color: COLORS.textLight,
        fontWeight: 'bold',
        marginTop: 2,
    },
    closeButton: {
        width: '100%',
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#FAFAFA',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textLight,
    },
    stuckButton: {
        backgroundColor: '#FF3B30',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
        ...SHADOWS.large,
    },
    stuckButtonTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: 0.5,
    },
    stuckButtonSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
});

export default HomeScreen;
