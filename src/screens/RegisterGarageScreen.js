import { ArrowLeft, Check, Navigation } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

const { width } = Dimensions.get('window');

const SPECIALTIES = [
    'Engine Overhaul',
    'Painting',
    'General Repair',
    'Electrical',
    'Tyre Change',
    'AC Service',
    'Brakes',
    'Towing',
    'Battery',
    'Suspension'
];

const RegisterGarageScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { createGarage } = useAppContext();
    const { location: userLoc } = useLocation();

    const [form, setForm] = useState({
        name: '',
        address: '',
        phone: '',
        experience: '',
        estimatedCost: '',
        rating: '4.5',
    });

    const [selectedSpecialties, setSelectedSpecialties] = useState([]);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userLoc?.coords) {
            setLocation({
                lat: userLoc.coords.latitude,
                lng: userLoc.coords.longitude,
            });
        }
    }, [userLoc]);

    const toggleSpecialty = (specialty) => {
        if (selectedSpecialties.includes(specialty)) {
            setSelectedSpecialties(prev => prev.filter(s => s !== specialty));
        } else {
            setSelectedSpecialties(prev => [...prev, specialty]);
        }
    };

    const handleRegister = async () => {
        if (!form.name || !form.address || !form.phone || !location) {
            Alert.alert('Error', 'Please fill in all required fields and pick a location on the map.');
            return;
        }

        if (selectedSpecialties.length === 0) {
            Alert.alert('Error', 'Please select at least one specialty.');
            return;
        }

        setLoading(true);
        try {
            const success = await createGarage({
                ownerEmail: user.email,
                ...form,
                specialties: selectedSpecialties,
                location: location
            });

            if (success) {
                Alert.alert('Success', 'Your garage has been registered successfully!', [
                    { text: 'OK', onPress: () => navigation.replace('Main', { screen: 'GarageDashboard' }) }
                ]);
            } else {
                Alert.alert('Error', 'Failed to register garage. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'An error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ArrowLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Register Your Garage</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <Text style={styles.sectionTitle}>Business Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Garage Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Hadapsar Royal Mechanics"
                            value={form.name}
                            onChangeText={(text) => setForm({ ...form, name: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Business Address *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Street, Area, City"
                            value={form.address}
                            onChangeText={(text) => setForm({ ...form, address: text })}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.md }]}>
                            <Text style={styles.label}>Phone Number *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+91 20 2689 9999"
                                keyboardType="phone-pad"
                                value={form.phone}
                                onChangeText={(text) => setForm({ ...form, phone: text })}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Experience</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 15 Years"
                                value={form.experience}
                                onChangeText={(text) => setForm({ ...form, experience: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.md }]}>
                            <Text style={styles.label}>Cost Range</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="₹1000 - ₹7000"
                                value={form.estimatedCost}
                                onChangeText={(text) => setForm({ ...form, estimatedCost: text })}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Initial Rating</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="4.5"
                                keyboardType="decimal-pad"
                                value={form.rating}
                                onChangeText={(text) => setForm({ ...form, rating: text })}
                            />
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Specialties</Text>
                    <View style={styles.specialtiesContainer}>
                        {SPECIALTIES.map((s) => (
                            <TouchableOpacity
                                key={s}
                                style={[
                                    styles.specialtyChip,
                                    selectedSpecialties.includes(s) && styles.specialtyChipActive
                                ]}
                                onPress={() => toggleSpecialty(s)}
                            >
                                <Text style={[
                                    styles.specialtyText,
                                    selectedSpecialties.includes(s) && styles.specialtyTextActive
                                ]}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Garage Location (Map) *</Text>
                    <Text style={styles.hintText}>Long press or drag the marker to pin your exact location</Text>

                    <View style={styles.mapContainer}>
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={styles.map}
                            initialRegion={{
                                latitude: location?.lat || 18.5204,
                                longitude: location?.lng || 73.8567,
                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05,
                            }}
                        >
                            {location && (
                                <Marker
                                    draggable
                                    coordinate={{
                                        latitude: location.lat,
                                        longitude: location.lng
                                    }}
                                    onDragEnd={(e) => setLocation({
                                        lat: e.nativeEvent.coordinate.latitude,
                                        lng: e.nativeEvent.coordinate.longitude
                                    })}
                                    title={form.name || "Your Garage"}
                                />
                            )}
                        </MapView>
                        <TouchableOpacity
                            style={styles.currentLocBtn}
                            onPress={() => {
                                if (userLoc?.coords) {
                                    setLocation({
                                        lat: userLoc.coords.latitude,
                                        lng: userLoc.coords.longitude
                                    });
                                }
                            }}
                        >
                            <Navigation size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && { opacity: 0.7 }]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Check size={20} color={COLORS.white} />
                                <Text style={styles.submitText}>Complete Registration</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    },
    backButton: {
        marginRight: SPACING.lg,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SPACING.lg,
        marginBottom: SPACING.md,
    },
    inputGroup: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.md,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        color: COLORS.text,
    },
    row: {
        flexDirection: 'row',
    },
    specialtiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    specialtyChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#EAEAEA',
    },
    specialtyChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    specialtyText: {
        fontSize: 13,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    specialtyTextActive: {
        color: COLORS.white,
    },
    hintText: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 8,
        fontStyle: 'italic',
    },
    mapContainer: {
        height: 250,
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 8,
        ...SHADOWS.small,
    },
    map: {
        flex: 1,
    },
    currentLocBtn: {
        position: 'absolute',
        right: 15,
        bottom: 15,
        backgroundColor: COLORS.white,
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        borderRadius: 18,
        marginTop: SPACING.xl * 1.5,
        marginBottom: SPACING.xl,
        ...SHADOWS.medium,
    },
    submitText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RegisterGarageScreen;
