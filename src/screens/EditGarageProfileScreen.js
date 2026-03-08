import { ArrowLeft, Check, Save } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';

const SPECIALTIES_LIST = [
    'General Service',
    'Engine Repair',
    'Oil Change',
    'Brakes',
    'Clutch Repair',
    'AC Service',
    'Electrical',
    'Towing',
    'Painting',
    'Washing',
];

const EditGarageProfileScreen = ({ navigation }) => {
    const { myGarage, updateGarageProfile } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: myGarage?.name || '',
        address: myGarage?.address || '',
        phone: myGarage?.phone || '',
        specialties: myGarage?.specialties || [],
    });

    const toggleSpecialty = (specialty) => {
        setFormData(prev => {
            const exists = prev.specialties.includes(specialty);
            if (exists) {
                return { ...prev, specialties: prev.specialties.filter(s => s !== specialty) };
            } else {
                return { ...prev, specialties: [...prev.specialties, specialty] };
            }
        });
    };

    const handleSave = async () => {
        if (!formData.name || !formData.address || !formData.phone) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        setLoading(true);
        const success = await updateGarageProfile(myGarage.id, formData);
        setLoading(false);

        if (success) {
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Error', 'Failed to update profile. Please try again.');
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
                    <Text style={styles.headerTitle}>Edit Business Profile</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Business Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Enter garage name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.address}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                            placeholder="Enter full address"
                            multiline
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.phone}
                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            placeholder="e.g. +91 9876543210"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <Text style={styles.label}>Specialties</Text>
                    <View style={styles.specialtiesGrid}>
                        {SPECIALTIES_LIST.map((item) => {
                            const isSelected = formData.specialties.includes(item);
                            return (
                                <TouchableOpacity
                                    key={item}
                                    style={[
                                        styles.specialtyChip,
                                        isSelected && styles.specialtyChipSelected
                                    ]}
                                    onPress={() => toggleSpecialty(item)}
                                >
                                    <Text style={[
                                        styles.specialtyText,
                                        isSelected && styles.specialtyTextSelected
                                    ]}>{item}</Text>
                                    {isSelected && <Check size={14} color={COLORS.white} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Save size={20} color={COLORS.white} />
                                <Text style={styles.saveText}>Save Changes</Text>
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
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        ...SHADOWS.small,
    },
    specialtiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
        marginBottom: SPACING.xl,
    },
    specialtyChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    specialtyChipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    specialtyText: {
        fontSize: 13,
        color: COLORS.text,
        fontWeight: '500',
    },
    specialtyTextSelected: {
        color: COLORS.white,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        borderRadius: 18,
        marginTop: SPACING.md,
        ...SHADOWS.medium,
    },
    saveText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditGarageProfileScreen;
