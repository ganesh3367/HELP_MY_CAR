import { ArrowLeft, Lock, ShieldCheck, Smartphone, Users } from 'lucide-react-native';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

const PrivacySafetyScreen = ({ navigation }) => {
    const PolicySection = ({ icon: Icon, title, content }) => (
        <View style={styles.policyCard}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: COLORS.primary + '15' }]}>
                    <Icon size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <Text style={styles.cardText}>{content}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & Safety</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.intro}>
                    At Help My Car, your privacy and safety are our top priorities. Here is how we protect your data and ensure a secure experience.
                </Text>

                <PolicySection
                    icon={Lock}
                    title="Data Protection"
                    content="We encrypt all personal information and payment details using industry-standard SSL technology. Your data is never shared with third parties without your explicit consent."
                />

                <PolicySection
                    icon={ShieldCheck}
                    title="Verified Professionals"
                    content="Every mechanic on our platform undergoes a multi-step verification process, including background checks and license verification, to ensure your vehicle is in safe hands."
                />

                <PolicySection
                    icon={Users}
                    title="Community Guidelines"
                    content="We maintain a strict zero-tolerance policy towards harassment or unprofessional behavior. Both users and mechanics are expected to treat each other with respect."
                />

                <PolicySection
                    icon={Smartphone}
                    title="Real-time Tracking"
                    content="For your safety, all service rides and mechanic arrivals are tracked in real-time. You can share your service status with friends or family at any time."
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Last Updated: March 2026</Text>
                    <TouchableOpacity>
                        <Text style={styles.fullPolicyLink}>Read Full Privacy Policy</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    intro: {
        fontSize: 15,
        color: COLORS.textLight,
        lineHeight: 22,
        marginBottom: SPACING.xl,
        textAlign: 'center',
    },
    policyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    cardText: {
        fontSize: 14,
        color: COLORS.textLight,
        lineHeight: 20,
    },
    footer: {
        marginTop: SPACING.xl,
        alignItems: 'center',
        paddingBottom: SPACING.xl,
    },
    footerText: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    fullPolicyLink: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

export default PrivacySafetyScreen;
