import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../components/Button';
import { SERVICE_CATEGORIES } from '../constants/mockData';
import { COLORS, SPACING } from '../constants/theme';

const CostEstimatorScreen = () => {
    const [selectedService, setSelectedService] = useState(SERVICE_CATEGORIES[0]);
    const [distance, setDistance] = useState('');
    const [estimate, setEstimate] = useState(null);

    const calculateEstimate = () => {
        const dist = parseFloat(distance) || 0;
        const price = selectedService.basePrice + (dist * 2); // Simple logic
        setEstimate(price.toFixed(2));
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>Cost Estimator</Text>

                <Text style={styles.label}>Select Issue</Text>
                <View style={styles.categories}>
                    {SERVICE_CATEGORIES.map((service) => (
                        <Button
                            key={service.id}
                            title={service.title}
                            variant={selectedService.id === service.id ? 'primary' : 'outline'}
                            onPress={() => setSelectedService(service)}
                            style={styles.categoryButton}
                            textStyle={styles.categoryButtonText}
                        />
                    ))}
                </View>

                <Text style={styles.label}>Distance (km)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter distance..."
                    keyboardType="numeric"
                    value={distance}
                    onChangeText={setDistance}
                />

                <Button
                    title="Calculate Estimate"
                    onPress={calculateEstimate}
                    style={styles.calculateButton}
                />

                {estimate && (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultLabel}>Estimated Price</Text>
                        <Text style={styles.resultValue}>${estimate}</Text>
                        <Text style={styles.resultNote}>*Actual price may vary based on specific conditions.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scroll: {
        padding: SPACING.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xl,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    categories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.xl,
    },
    categoryButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 12,
    },
    categoryButtonText: {
        fontSize: 14,
    },
    input: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    calculateButton: {
        marginBottom: SPACING.xl,
    },
    resultCard: {
        backgroundColor: '#FFF5E6',
        padding: SPACING.lg,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    resultLabel: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    resultValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    resultNote: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 8,
        textAlign: 'center',
    },
});

export default CostEstimatorScreen;
