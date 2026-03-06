/**
 * CostEstimatorScreen — Estimate Indian mechanic costs with part-wise breakdown
 * Features: service type picker, car segment (hatch/sedan/SUV), parts breakdown,
 *           labour vs parts split, "Find Mechanics" CTA
 */
import { useNavigation } from '@react-navigation/native';
import { Calculator, ChevronRight, Info } from 'lucide-react-native';
import { useState } from 'react';
import {
    ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

// ── Pricing data (INR) ───────────────────────────────────────────────────────
const CAR_SEGMENTS = [
    { id: 'hatch', label: '🚗 Hatchback', multiplier: 1.0 },
    { id: 'sedan', label: '🚙 Sedan / MUV', multiplier: 1.3 },
    { id: 'suv', label: '🚕 SUV / Crossover', multiplier: 1.65 },
    { id: 'luxury', label: '🏎 Luxury / Import', multiplier: 2.4 },
];

const SERVICES = [
    {
        id: 'oil', emoji: '🛢', label: 'Oil Change',
        parts: [{ name: 'Engine Oil (4L)', cost: 900 }, { name: 'Oil Filter', cost: 220 }],
        labour: 300, time: '30–45 min',
    },
    {
        id: 'battery', emoji: '🔋', label: 'Battery Replacement',
        parts: [{ name: 'Car Battery (35Ah)', cost: 3200 }],
        labour: 400, time: '20–30 min',
    },
    {
        id: 'tyre', emoji: '🔄', label: 'Tyre Change (x4)',
        parts: [{ name: 'Tyres × 4', cost: 8000 }, { name: 'Balancing + Alignment', cost: 800 }],
        labour: 800, time: '45–60 min',
    },
    {
        id: 'brake', emoji: '🛑', label: 'Brake Pads',
        parts: [{ name: 'Brake Pads (Front)', cost: 1200 }, { name: 'Resurfacing', cost: 400 }],
        labour: 600, time: '1–1.5 hrs',
    },
    {
        id: 'ac', emoji: '❄️', label: 'AC Service',
        parts: [{ name: 'Refrigerant Gas', cost: 1500 }, { name: 'Cabin Filter', cost: 400 }],
        labour: 700, time: '1–2 hrs',
    },
    {
        id: 'engine', emoji: '⚙️', label: 'Engine Tune-Up',
        parts: [{ name: 'Spark Plugs × 4', cost: 1000 }, { name: 'Air Filter', cost: 500 }, { name: 'Fuel Filter', cost: 350 }],
        labour: 1200, time: '2–3 hrs',
    },
    {
        id: 'suspension', emoji: '🔩', label: 'Suspension Check',
        parts: [{ name: 'Shock Absorbers (pair)', cost: 4000 }],
        labour: 1500, time: '2–4 hrs',
    },
    {
        id: 'coolant', emoji: '💧', label: 'Coolant Flush',
        parts: [{ name: 'Coolant (5L)', cost: 600 }, { name: 'Thermostat', cost: 400 }],
        labour: 500, time: '45–60 min',
    },
];

const CostEstimatorScreen = () => {
    const navigation = useNavigation();
    const [selectedService, setSelectedService] = useState(SERVICES[0]);
    const [selectedSegment, setSelectedSegment] = useState(CAR_SEGMENTS[0]);
    const [showResult, setShowResult] = useState(false);

    const m = selectedSegment.multiplier;
    const partTotal = selectedService.parts.reduce((sum, p) => sum + p.cost, 0);
    const labourTotal = Math.round(selectedService.labour * m);
    const partsAdjusted = Math.round(partTotal * m);
    const total = partsAdjusted + labourTotal;
    const minTotal = Math.round(total * 0.85);
    const maxTotal = Math.round(total * 1.30);

    const calculate = () => setShowResult(true);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Title */}
                <View style={styles.titleRow}>
                    <Calculator size={26} color={COLORS.primary} />
                    <Text style={styles.title}>Cost Estimator</Text>
                </View>
                <Text style={styles.subtitle}>Get instant repair cost estimates in India</Text>

                {/* Car segment */}
                <Text style={styles.sectionLabel}>1. Your Car Type</Text>
                <View style={styles.segmentGrid}>
                    {CAR_SEGMENTS.map(seg => (
                        <TouchableOpacity
                            key={seg.id}
                            style={[styles.segChip, selectedSegment.id === seg.id && styles.segChipActive]}
                            onPress={() => { setSelectedSegment(seg); setShowResult(false); }}
                        >
                            <Text style={[styles.segText, selectedSegment.id === seg.id && { color: COLORS.white }]}>
                                {seg.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Service */}
                <Text style={styles.sectionLabel}>2. Select Service</Text>
                <View style={styles.serviceGrid}>
                    {SERVICES.map(svc => (
                        <TouchableOpacity
                            key={svc.id}
                            style={[styles.svcCard, selectedService.id === svc.id && styles.svcCardActive]}
                            onPress={() => { setSelectedService(svc); setShowResult(false); }}
                        >
                            <Text style={{ fontSize: 28, textAlign: 'center' }}>{svc.emoji}</Text>
                            <Text style={[styles.svcLabel, selectedService.id === svc.id && { color: COLORS.white }]}>
                                {svc.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Estimate button */}
                <TouchableOpacity style={styles.calcBtn} onPress={calculate}>
                    <Calculator size={20} color={COLORS.white} />
                    <Text style={styles.calcText}>Calculate Estimate</Text>
                </TouchableOpacity>

                {/* Results */}
                {showResult && (
                    <View style={styles.resultCard}>
                        {/* Range banner */}
                        <View style={styles.rangeBanner}>
                            <Text style={styles.rangeLabel}>Estimated Range</Text>
                            <Text style={styles.rangeValue}>
                                ₹{minTotal.toLocaleString('en-IN')} – ₹{maxTotal.toLocaleString('en-IN')}
                            </Text>
                            <Text style={styles.rangeTime}>⏱ Typical time: {selectedService.time}</Text>
                        </View>

                        {/* Breakdown */}
                        <Text style={styles.breakTitle}>Cost Breakdown</Text>
                        {selectedService.parts.map((p, i) => (
                            <View key={i} style={styles.breakRow}>
                                <Text style={styles.breakName}>{p.name}</Text>
                                <Text style={styles.breakCost}>₹{Math.round(p.cost * m).toLocaleString('en-IN')}</Text>
                            </View>
                        ))}
                        <View style={[styles.breakRow, styles.labourRow]}>
                            <Text style={styles.breakName}>🔧 Labour Charges</Text>
                            <Text style={styles.breakCost}>₹{labourTotal.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.breakRow}>
                            <Text style={styles.totalLabel}>Total (estimated)</Text>
                            <Text style={styles.totalValue}>₹{total.toLocaleString('en-IN')}</Text>
                        </View>

                        {/* Disclaimer */}
                        <View style={styles.disclaimer}>
                            <Info size={13} color="#888" />
                            <Text style={styles.disclaimerText}>
                                Prices are estimates for {selectedSegment.label} cars. Actual cost depends on brand, condition & location.
                            </Text>
                        </View>

                        {/* CTA */}
                        <TouchableOpacity
                            style={styles.findBtn}
                            onPress={() => navigation.navigate('Main', { screen: 'Nearby' })}
                        >
                            <Text style={styles.findText}>Find Nearby Mechanics</Text>
                            <ChevronRight size={18} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    scroll: { padding: SPACING.lg, paddingBottom: 50 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
    title: { fontSize: 26, fontWeight: '900', color: COLORS.text },
    subtitle: { fontSize: 14, color: COLORS.textLight, marginBottom: SPACING.xl },
    sectionLabel: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 12 },

    segmentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SPACING.xl },
    segChip: {
        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
        backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: '#E0E0E0', ...SHADOWS.small,
    },
    segChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    segText: { fontSize: 13, fontWeight: '700', color: COLORS.text },

    serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SPACING.xl },
    svcCard: {
        width: (342 - SPACING.lg * 2 - 30) / 4,
        paddingVertical: 12, borderRadius: 16,
        backgroundColor: COLORS.white, alignItems: 'center', ...SHADOWS.small,
        borderWidth: 1.5, borderColor: '#E0E0E0',
    },
    svcCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    svcLabel: { fontSize: 10, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginTop: 6 },

    calcBtn: {
        backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        marginBottom: SPACING.xl, ...SHADOWS.medium,
    },
    calcText: { fontSize: 17, fontWeight: '900', color: COLORS.white },

    resultCard: { backgroundColor: COLORS.white, borderRadius: 24, overflow: 'hidden', ...SHADOWS.large },
    rangeBanner: { backgroundColor: COLORS.primary, padding: SPACING.lg, alignItems: 'center' },
    rangeLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '700' },
    rangeValue: { fontSize: 30, fontWeight: '900', color: COLORS.white, marginTop: 4 },
    rangeTime: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 6, fontWeight: '600' },

    breakTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, padding: 16, paddingBottom: 8 },
    breakRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
    labourRow: { backgroundColor: '#FFF8E1' },
    breakName: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
    breakCost: { fontSize: 14, color: COLORS.text, fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 16 },
    totalLabel: { fontSize: 16, fontWeight: '900', color: COLORS.text },
    totalValue: { fontSize: 18, fontWeight: '900', color: COLORS.primary },

    disclaimer: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        padding: 16, backgroundColor: '#F7F8FA', gap: 6,
    },
    disclaimerText: { flex: 1, fontSize: 11, color: '#888', lineHeight: 16 },

    findBtn: {
        backgroundColor: COLORS.primary, margin: 16, marginTop: 8,
        borderRadius: 14, paddingVertical: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    findText: { fontSize: 15, fontWeight: '800', color: COLORS.white },
});

export default CostEstimatorScreen;
