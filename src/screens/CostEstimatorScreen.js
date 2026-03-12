/**
 * CostEstimatorScreen — Disabled (pricing removed).
 */
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, Info } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

const CostEstimatorScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Pricing removed</Text>
                <View style={styles.tipBox}>
                    <Info size={16} color={COLORS.primary} />
                    <Text style={styles.tipText}>
                        Cost estimation has been removed from the app. You can still browse mechanics and request service.
                    </Text>
                </View>
                <TouchableOpacity style={styles.findBtn} onPress={() => navigation.navigate('Main', { screen: 'Mechanics' })}>
                    <Text style={styles.findText}>Find Mechanics</Text>
                    <ChevronRight size={18} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA', padding: SPACING.lg, justifyContent: 'center' },
    card: { backgroundColor: COLORS.white, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#F0F0F0', ...SHADOWS.small },
    title: { fontSize: 20, fontWeight: '900', color: COLORS.text, marginBottom: 12 },
    tipBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.primary + '10', padding: 12, borderRadius: 14, marginBottom: 14 },
    tipText: { flex: 1, fontSize: 12, color: COLORS.primary, fontWeight: '700' },
    findBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: COLORS.primary + '40' },
    findText: { fontSize: 14, fontWeight: '900', color: COLORS.primary },
});

export default CostEstimatorScreen;
