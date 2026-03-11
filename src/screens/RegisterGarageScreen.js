import { ArrowLeft, Check, LogOut, Navigation } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
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

const RegisterGarageScreen = ({ navigation, route }) => {
    const { user, logout, updateUser } = useAuth();
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

    // Initial setup with user location, but overwrite if picked from map
    useEffect(() => {
        if (route.params?.pickedLocation) {
            setLocation({
                lat: route.params.pickedLocation.lat,
                lng: route.params.pickedLocation.lng,
            });
        } else if (userLoc?.coords && !location) {
            setLocation({
                lat: userLoc.coords.latitude,
                lng: userLoc.coords.longitude,
            });
        }
    }, [userLoc, route.params?.pickedLocation]);

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
                name: form.name,
                address: form.address,
                phone: form.phone,
                experience: form.experience || "Not Provided",
                estimatedCost: form.estimatedCost || "TBD",
                rating: parseFloat(form.rating) || 5,
                reviewCount: 1, // Initial count
                specialties: selectedSpecialties,
                location: {
                    lat: location.lat,
                    lng: location.lng
                }
            });

            if (success) {
                // Update global auth state to trigger redirect to home
                await updateUser({ ...user, hasGarageProfile: true });
                Alert.alert('Success', 'Your garage has been registered successfully!');
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
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {navigation.canGoBack() && (
                            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                <ArrowLeft size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        )}
                        <View>
                            <Text style={styles.headerTitle}>Professional Onboarding</Text>
                            <Text style={styles.headerSub}>Step 2: Business Profile Setup</Text>
                        </View>
                    </View>

                    {!navigation.canGoBack() && (
                        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                            <LogOut size={22} color={COLORS.danger || '#EF4444'} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '100%' }]} />
                    </View>
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

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Garage Location *</Text>
                    </View>

                    <View style={styles.instructionBanner}>
                        <View style={styles.instructionRow}>
                            <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
                            <Text style={styles.instructionText}>Tap the button below to open the Map Screen</Text>
                        </View>
                        <View style={styles.instructionRow}>
                            <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
                            <Text style={styles.instructionText}>Drag the 📌 marker exactly to your repair shop location to ensure perfect mechanic-to-customer routing.</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.pinDropBtn, location && styles.pinDropBtnSuccess]}
                        onPress={() => navigation.navigate('LocationPicker', { initialLocation: location, returnScreen: 'RegisterGarage' })}
                    >
                        {location ? (
                            <>
                                <Check size={20} color={COLORS.white} />
                                <Text style={styles.pinDropBtnText}>Exact Location Saved!</Text>
                            </>
                        ) : (
                            <>
                                <Navigation size={20} color={COLORS.primary} />
                                <Text style={[styles.pinDropBtnText, { color: COLORS.primary }]}>Pin Exact Garage Location</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <Button
                        title="Complete Registration"
                        onPress={handleRegister}
                        loading={loading}
                        style={styles.submitButton}
                        variant="primary"
                    />
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
        justifyContent: 'space-between',
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    },
    backButton: {
        marginRight: SPACING.lg,
    },
    logoutButton: {
        padding: SPACING.sm,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    headerSub: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 2,
        fontWeight: '500',
    },
    progressContainer: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
        backgroundColor: COLORS.white,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.lg,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    instructionBanner: {
        backgroundColor: '#F0F7FF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#D0E5FF',
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepNum: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    stepNumText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    instructionText: {
        flex: 1,
        fontSize: 12,
        color: '#2C5282',
        lineHeight: 16,
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
    // ─ Location Pinning ───────────────────────────────────────────────────────
    pinDropBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary + '15',
        borderWidth: 1.5,
        borderColor: COLORS.primary + '30',
        borderRadius: 16,
        paddingVertical: 18,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        gap: 10,
    },
    pinDropBtnSuccess: {
        backgroundColor: '#27ae60',
        borderColor: '#27ae60',
    },
    pinDropBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.white,
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
