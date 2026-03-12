import { ArrowLeft, Check, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
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
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const SPECIALTIES_LIST = [
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

const EditGarageProfileScreen = ({ navigation }) => {
    const { myGarage, updateGarageProfile, deleteGarage } = useAppContext();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: myGarage?.name || '',
        address: myGarage?.address || '',
        phone: myGarage?.phone || '',
        experience: myGarage?.experience || '',
        rating: myGarage?.rating?.toString() || '4.5',
        specialties: myGarage?.specialties || [],
        location: myGarage?.location || { lat: 18.5204, lng: 73.8567 },
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
        if (!formData.name || !formData.address || !formData.phone || !formData.location) {
            Alert.alert('Error', 'Please fill in all required fields and confirm location.');
            return;
        }

        setLoading(true);
        const success = await updateGarageProfile(myGarage.id, {
            ...formData,
            rating: parseFloat(formData.rating) || 4.5
        });
        setLoading(false);

        if (success) {
            Alert.alert('Success', 'Business profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Business Bio',
            'Are you sure you want to delete your garage profile? This action cannot be undone and your business will no longer be visible to customers.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        const success = await deleteGarage(myGarage.id);
                        if (success) {
                            await updateUser({ ...user, hasGarageProfile: false });
                            Alert.alert('Deleted', 'Your garage profile has been removed.');
                        } else {
                            Alert.alert('Error', 'Could not delete profile. Please try again.');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
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
                    <Text style={styles.headerTitle}>Business Profile</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>General Information</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Garage Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder=""
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Business Address *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.address}
                                onChangeText={(text) => setFormData({ ...formData, address: text })}
                                placeholder=""
                                multiline
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.md }]}>
                                <Text style={styles.label}>Phone Number *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.phone}
                                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                    keyboardType="phone-pad"
                                    placeholder=""
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Experience</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.experience}
                                    onChangeText={(text) => setFormData({ ...formData, experience: text })}
                                    placeholder=""
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Display Rating</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.rating}
                                    onChangeText={(text) => setFormData({ ...formData, rating: text })}
                                    keyboardType="decimal-pad"
                                    placeholder=""
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Specialties</Text>
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
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Business Location</Text>
                        <Text style={styles.hintText}>Drag the marker to update your exact pin drop</Text>

                        <View style={styles.mapContainer}>
                            <MapView
                                provider={PROVIDER_GOOGLE}
                                style={styles.map}
                                initialRegion={{
                                    latitude: formData.location?.lat || 18.5204,
                                    longitude: formData.location?.lng || 73.8567,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                            >
                                <Marker
                                    draggable
                                    coordinate={{
                                        latitude: formData.location.lat,
                                        longitude: formData.location.lng
                                    }}
                                    onDragEnd={(e) => setFormData({
                                        ...formData,
                                        location: {
                                            lat: e.nativeEvent.coordinate.latitude,
                                            lng: e.nativeEvent.coordinate.longitude
                                        }
                                    })}
                                    title={formData.name || "Your Garage"}
                                />
                            </MapView>
                        </View>
                    </View>

                    <Button
                        title="Update Business Profile"
                        onPress={handleSave}
                        loading={loading}
                        style={styles.saveButton}
                    />

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                        disabled={loading}
                    >
                        <Trash2 size={20} color={COLORS.error || '#FF3B30'} />
                        <Text style={styles.deleteText}>Delete Garage Bio</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        marginRight: SPACING.lg,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.lg,
    },
    inputGroup: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    row: {
        flexDirection: 'row',
    },
    specialtiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    specialtyChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
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
    hintText: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 12,
        fontStyle: 'italic',
    },
    mapContainer: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    map: {
        flex: 1,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        borderRadius: 16,
        marginTop: SPACING.md,
        ...SHADOWS.medium,
    },
    saveText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 24,
        padding: 12,
    },
    deleteText: {
        color: COLORS.error || '#FF3B30',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default EditGarageProfileScreen;
