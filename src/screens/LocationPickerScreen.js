import { ArrowLeft, Check, MapPin } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useLocation } from '../context/LocationContext';

const { width, height } = Dimensions.get('window');

const LocationPickerScreen = ({ navigation, route }) => {
    const { location } = useLocation();
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    });

    // If passed a prior location, use it
    useEffect(() => {
        if (route.params?.initialLocation) {
            setRegion({
                ...region,
                latitude: route.params.initialLocation.lat,
                longitude: route.params.initialLocation.lng,
            });
        } else if (location?.coords) {
            setRegion({
                ...region,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        }
    }, [location, route.params]);

    const onRegionChangeComplete = (newRegion) => {
        setRegion(newRegion);
    };

    const confirmLocation = () => {
        // Pass back the center of the map (where the pin is fixed)
        navigation.navigate('Nearby', {
            pickedLocation: {
                lat: region.latitude,
                lng: region.longitude,
            }
        });
    };

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={region}
                onRegionChangeComplete={onRegionChangeComplete}
            />

            {/* Fixed Center Pin */}
            <View style={styles.centerMarkerContainer} pointerEvents="none">
                <MapPin size={48} color={COLORS.primary} fill={COLORS.white} />
                <View style={styles.shadow} />
            </View>

            {/* Header / Back */}
            <SafeAreaView style={styles.headerOverlay} pointerEvents="box-none">
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Pin Your Location</Text>
                    <Text style={styles.headerSubtitle}>Move map to adjust</Text>
                </View>
            </SafeAreaView>

            {/* Bottom Panel */}
            <View style={styles.bottomPanel}>
                <View style={styles.addressBox}>
                    <Text style={styles.addressLabel}>Selected Location</Text>
                    <Text style={styles.addressText}>
                        {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
                    </Text>
                    <Text style={styles.hintText}>(Drag map to refine)</Text>
                </View>

                <TouchableOpacity style={styles.confirmButton} onPress={confirmLocation}>
                    <Check size={24} color={COLORS.white} />
                    <Text style={styles.confirmText}>Confirm Location</Text>
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
    map: {
        width,
        height,
    },
    centerMarkerContainer: {
        position: 'absolute',
        top: (height / 2) - 24, // Adjust for pin size
        left: (width / 2) - 24,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    shadow: {
        width: 10,
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 5,
        marginTop: 2,
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: SPACING.md,
        alignItems: 'flex-start',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: 10,
        marginRight: 44, // Balance back button
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    headerSubtitle: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 4,
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        overflow: 'hidden',
    },
    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: SPACING.xl,
        paddingBottom: 40,
        ...SHADOWS.large,
    },
    addressBox: {
        marginBottom: SPACING.lg,
    },
    addressLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        textTransform: 'uppercase',
        fontWeight: '700',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
    },
    hintText: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
        fontStyle: 'italic',
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 20,
        gap: 10,
        ...SHADOWS.medium,
    },
    confirmText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LocationPickerScreen;
