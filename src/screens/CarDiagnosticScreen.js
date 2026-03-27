
import { useNavigation } from '@react-navigation/native';
import { AlertTriangle, CheckCircle, ChevronRight, HelpCircle, RefreshCw } from 'lucide-react-native';
import { useState } from 'react';
import {
    ScrollView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';


const SYMPTOMS = [
    { id: 'no_start', label: "Car won't start", group: 'General' },
    { id: 'engine_noise', label: 'Knocking / noise from engine', group: 'Engine' },
    { id: 'overheating', label: 'Engine overheating', group: 'Engine' },
    { id: 'smoke_white', label: 'White smoke from exhaust', group: 'Engine' },
    { id: 'smoke_black', label: 'Black smoke from exhaust', group: 'Engine' },
    { id: 'battery_warn', label: 'Battery warning light', group: 'Electrical' },
    { id: 'check_engine', label: 'Check Engine light on', group: 'Electrical' },
    { id: 'ac_not_cool', label: 'AC not cooling', group: 'AC' },
    { id: 'brake_squeal', label: 'Brakes squeaking / grinding', group: 'Brakes' },
    { id: 'vibration', label: 'Steering wheel vibrates', group: 'Suspension' },
    { id: 'tyre_flat', label: 'Flat / punctured tyre', group: 'Tyres' },
    { id: 'power_loss', label: 'Loss of power', group: 'Engine' },
    { id: 'stall', label: 'Engine stalls / dies', group: 'Engine' },
    { id: 'rough_idle', label: 'Rough idle / shaking', group: 'Engine' },
    { id: 'leak_oil', label: 'Oil leak under car', group: 'Engine' },
    { id: 'leak_coolant', label: 'Coolant / water leak', group: 'Engine' },
];


const DIAGNOSES = [
    {
        id: 'battery',
        label: 'Weak or Dead Battery',
        urgency: 'HIGH',
        match: ['no_start', 'battery_warn'],
        desc: 'Battery voltage is likely too low to start the engine. Could also be a faulty alternator.',
        cost: '₹3,000 – ₹6,500',
        fix: 'Battery Replacement',
    },
    {
        id: 'overheating',
        label: 'Engine Overheating',
        urgency: 'CRITICAL',
        match: ['overheating', 'smoke_white', 'leak_coolant'],
        desc: 'Coolant loss, a failed thermostat, or radiator blockage can all cause overheating. Stop driving immediately.',
        cost: '₹2,500 – ₹12,000',
        fix: 'Cooling System Service',
    },
    {
        id: 'brake_wear',
        label: 'Worn Brake Pads',
        urgency: 'HIGH',
        match: ['brake_squeal', 'vibration'],
        desc: 'Squealing indicates brake pads have reached their wear indicator. Grinding means metal-on-metal.',
        cost: '₹1,800 – ₹4,500',
        fix: 'Brake Pad Replacement',
    },
    {
        id: 'engine_tune',
        label: 'Engine Needs Tune-Up',
        urgency: 'MEDIUM',
        match: ['rough_idle', 'stall', 'check_engine', 'power_loss'],
        desc: 'Faulty spark plugs, dirty air filter, or clogged fuel injectors can cause rough running.',
        cost: '₹2,000 – ₹8,000',
        fix: 'Engine Tune-Up',
    },
    {
        id: 'oil_leak',
        label: 'Engine Oil Leak',
        urgency: 'MEDIUM',
        match: ['leak_oil', 'engine_noise'],
        desc: 'Oil leaks from gaskets, seals, or drain plug indicate loss of lubrication. Long-term can cause engine damage.',
        cost: '₹800 – ₹5,000',
        fix: 'Oil Leak Repair',
    },
    {
        id: 'ac_fault',
        label: 'AC System Issue',
        urgency: 'LOW',
        match: ['ac_not_cool'],
        desc: 'Low refrigerant gas or a failed compressor are the most common causes.',
        cost: '₹1,500 – ₹5,500',
        fix: 'AC Service / Gas Refill',
    },
    {
        id: 'tyre',
        label: 'Tyre Issue',
        urgency: 'HIGH',
        match: ['tyre_flat'],
        desc: 'A flat tyre needs immediate replacement or repair. Continuing to drive damages the rim.',
        cost: '₹300 – ₹1,200',
        fix: 'Tyre Repair / Replacement',
    },
    {
        id: 'exhaust',
        label: 'Fuel / Exhaust Issue',
        urgency: 'MEDIUM',
        match: ['smoke_black', 'power_loss'],
        desc: 'Black smoke means the engine is running rich (too much fuel). Could be injectors or air filter.',
        cost: '₹1,500 – ₹7,000',
        fix: 'Fuel System Inspection',
    },
];

const URGENCY_CONFIG = {
    CRITICAL: { color: '#FF3B30', bg: '#FFF0F0', label: 'CRITICAL — Stop driving now!' },
    HIGH: { color: '#FF9500', bg: '#FFF8E6', label: 'HIGH — Book a mechanic today' },
    MEDIUM: { color: '#5856D6', bg: '#F3F2FF', label: 'MEDIUM — Fix within a week' },
    LOW: { color: '#34C759', bg: '#F0FFF7', label: 'LOW — Schedule when convenient' },
};


const CarDiagnosticScreen = () => {
    const navigation = useNavigation();
    const [selected, setSelected] = useState(new Set());
    const [results, setResults] = useState(null);

    const toggleSymptom = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
        setResults(null);
    };

    const diagnose = () => {
        if (selected.size === 0) return;
        const selectedArr = Array.from(selected);
        const matches = DIAGNOSES
            .map(d => {
                const score = d.match.filter(s => selectedArr.includes(s)).length;
                return { ...d, score };
            })
            .filter(d => d.score > 0)
            .sort((a, b) => {
                const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
                return (order[b.urgency] - order[a.urgency]) || (b.score - a.score);
            });
        setResults(matches.length > 0 ? matches : []);
    };

    const reset = () => { setSelected(new Set()); setResults(null); };

    const groups = [...new Set(SYMPTOMS.map(s => s.group))];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {}
                <View style={styles.header}>
                    <Text style={styles.title}>Car Diagnostic</Text>
                    <Text style={styles.subtitle}>Select symptoms your car is showing</Text>
                </View>

                {}
                {!results && groups.map(g => (
                    <View key={g} style={{ marginBottom: 18 }}>
                        <Text style={styles.groupLabel}>{g}</Text>
                        <View style={styles.chipGrid}>
                            {SYMPTOMS.filter(s => s.group === g).map(s => {
                                const active = selected.has(s.id);
                                return (
                                    <TouchableOpacity
                                        key={s.id}
                                        style={[styles.chip, active && styles.chipActive]}
                                        onPress={() => toggleSymptom(s.id)}
                                    >
                                        <Text style={[styles.chipText, active && { color: COLORS.white }]}>
                                            {s.label}
                                        </Text>
                                        {active && <CheckCircle size={14} color={COLORS.white} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}

                {}
                {!results && (
                    <TouchableOpacity
                        style={[styles.diagnoseBtn, selected.size === 0 && { opacity: 0.4 }]}
                        onPress={diagnose}
                        disabled={selected.size === 0}
                    >
                        <Text style={styles.diagnoseBtnText}>
                            Diagnose ({selected.size} symptom{selected.size !== 1 ? 's' : ''})
                        </Text>
                    </TouchableOpacity>
                )}

                {}
                {results !== null && (
                    <>
                        <View style={styles.resultHeader}>
                            <Text style={styles.resultTitle}>
                                {results.length > 0 ? `${results.length} Possible Issue${results.length > 1 ? 's' : ''} Found` : 'No Match Found'}
                            </Text>
                            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
                                <RefreshCw size={16} color={COLORS.primary} />
                                <Text style={styles.resetText}>Retry</Text>
                            </TouchableOpacity>
                        </View>

                        {results.length === 0 && (
                            <View style={styles.noMatchCard}>
                                <HelpCircle size={40} color={COLORS.textLight} />
                                <Text style={styles.noMatchText}>
                                    Couldn{"'"}t identify the issue from these symptoms. A professional inspection is recommended.
                                </Text>
                            </View>
                        )}

                        {results.map((r, i) => {
                            const urg = URGENCY_CONFIG[r.urgency];
                            return (
                                <View key={r.id} style={[styles.resultCard, { borderLeftColor: urg.color }]}>
                                    {}
                                    <View style={styles.resultCardHeader}>
                                        <AlertTriangle size={28} color={urg.color} />
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={styles.issueLabel}>{r.label}</Text>
                                            <View style={[styles.urgBadge, { backgroundColor: urg.bg }]}>
                                                <Text style={[styles.urgText, { color: urg.color }]}>{urg.label}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {}
                                    <Text style={styles.issueDesc}>{r.desc}</Text>

                                    {}
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoItem}>
                                            <Text style={styles.infoLabel}>Estimated Cost</Text>
                                            <Text style={styles.infoVal}>{r.cost}</Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Text style={styles.infoLabel}>Recommended Fix</Text>
                                            <Text style={styles.infoVal}>{r.fix}</Text>
                                        </View>
                                    </View>

                                    {}
                                    <TouchableOpacity
                                        style={[styles.bookBtn, { backgroundColor: urg.color }]}
                                        onPress={() => navigation.navigate('Main', { screen: 'Nearby' })}
                                    >
                                        <Text style={styles.bookText}>Find a Mechanic</Text>
                                        <ChevronRight size={16} color={COLORS.white} />
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    scroll: { padding: SPACING.lg, paddingBottom: 60 },
    header: { marginBottom: SPACING.xl },
    title: { fontSize: 26, fontWeight: '900', color: COLORS.text },
    subtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },

    groupLabel: { fontSize: 13, fontWeight: '800', color: COLORS.textLight, textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 },
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 13, paddingVertical: 9, borderRadius: 14,
        backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: '#E0E0E0', ...SHADOWS.small,
    },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { fontSize: 13, fontWeight: '600', color: COLORS.text },

    diagnoseBtn: {
        backgroundColor: COLORS.primary, borderRadius: 18, paddingVertical: 18,
        alignItems: 'center', marginTop: 10, marginBottom: 20, ...SHADOWS.medium,
    },
    diagnoseBtnText: { fontSize: 18, fontWeight: '900', color: COLORS.white },

    resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    resultTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text },
    resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    resetText: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },

    noMatchCard: {
        backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.xl,
        alignItems: 'center', ...SHADOWS.small,
    },
    noMatchText: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 12, lineHeight: 22 },

    resultCard: {
        backgroundColor: COLORS.white, borderRadius: 20, padding: 16,
        marginBottom: 16, borderLeftWidth: 5, ...SHADOWS.medium,
    },
    resultCardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    issueLabel: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
    urgBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    urgText: { fontSize: 11, fontWeight: '800' },
    issueDesc: { fontSize: 13, color: COLORS.textLight, lineHeight: 20, marginBottom: 14 },

    infoRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
    infoItem: { flex: 1, backgroundColor: '#F7F8FA', borderRadius: 12, padding: 12 },
    infoLabel: { fontSize: 10, color: COLORS.textLight, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
    infoVal: { fontSize: 13, color: COLORS.text, fontWeight: '800' },

    bookBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, borderRadius: 14, paddingVertical: 12,
    },
    bookText: { fontSize: 15, fontWeight: '800', color: COLORS.white },
});

export default CarDiagnosticScreen;
