import { Car, ChevronRight, ShieldCheck, Wrench } from 'lucide-react-native';
import React from 'react';
import {
    Dimensions,
    ImageBackground,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

const RoleSelectionScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ImageBackground
                
                source={{ uri: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2000&auto=format&fit=crop' }}
                style={styles.heroBackground}
            >
                <View style={styles.overlay} />

                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        <Text style={styles.brandTitle}>HELP MY CAR</Text>
                        <Text style={styles.heroTitle}>Your Roadside{"\n"}Partner & Business Hub</Text>
                        <Text style={styles.heroSub}>Choose your path to get started</Text>
                    </View>

                    <View style={styles.cardsContainer}>
                        {}
                        <TouchableOpacity
                            style={styles.roleCard}
                            onPress={() => navigation.navigate('Signup', { role: 'user' })}
                            activeOpacity={0.9}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#FF8C0015' }]}>
                                <Car size={32} color={COLORS.primary} />
                            </View>
                            <View style={styles.cardTextContent}>
                                <Text style={styles.cardTitle}>I Need Help</Text>
                                <Text style={styles.cardDescription}>
                                    Find nearby mechanics, tow trucks, and diagnostic help instantly.
                                </Text>
                                <View style={styles.featureRow}>
                                    <ShieldCheck size={14} color={COLORS.primary} />
                                    <Text style={styles.featureText}>Verified mechanics nearby</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color={COLORS.textLight} />
                        </TouchableOpacity>

                        {}
                        <TouchableOpacity
                            style={[styles.roleCard, { marginTop: 16 }]}
                            onPress={() => navigation.navigate('Signup', { role: 'garage' })}
                            activeOpacity={0.9}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#FF8C0015' }]}>
                                <Wrench size={32} color={COLORS.primary} />
                            </View>
                            <View style={styles.cardTextContent}>
                                <Text style={styles.cardTitle}>I Have a Garage</Text>
                                <Text style={styles.cardDescription}>
                                    List your business, manage orders, and grow your local presence.
                                </Text>
                                <View style={styles.featureRow}>
                                    <ShieldCheck size={14} color={COLORS.primary} />
                                    <Text style={styles.featureText}>Professional business tools</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color={COLORS.textLight} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginText}>
                                Already have an account? <Text style={styles.loginLink}>Sign In</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    heroBackground: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.85)', 
    },
    safeArea: {
        flex: 1,
        padding: SPACING.xl,
        justifyContent: 'space-between',
    },
    header: {
        marginTop: 40,
    },
    brandTitle: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 4,
        marginBottom: 8,
    },
    heroTitle: {
        color: COLORS.text,
        fontSize: 36,
        fontWeight: '900',
        lineHeight: 42,
        letterSpacing: -1,
    },
    heroSub: {
        color: COLORS.textLight,
        fontSize: 16,
        marginTop: 12,
        fontWeight: '500',
    },
    cardsContainer: {
        width: '100%',
    },
    roleCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...SHADOWS.medium,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTextContent: {
        flex: 1,
        marginLeft: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
    },
    cardDescription: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 4,
        lineHeight: 18,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 6,
    },
    featureText: {
        fontSize: 11,
        color: COLORS.primary,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    loginText: {
        color: COLORS.textLight,
        fontSize: 15,
    },
    loginLink: {
        color: COLORS.primary,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

export default RoleSelectionScreen;
