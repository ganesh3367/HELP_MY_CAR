import { Car } from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';
import { Animated, ImageBackground, StatusBar, StyleSheet, Text, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

const SplashScreen = ({ navigation }) => {
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const scaleAnim = useMemo(() => new Animated.Value(0.8), []);

    useEffect(() => {
        // Synchronized animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();

        const timer = setTimeout(() => {
            navigation.replace('RoleSelection');
        }, 3500);

        return () => clearTimeout(timer);
    }, [fadeAnim, scaleAnim, navigation]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop' }}
                style={styles.background}
            >
                <View style={styles.overlay} />

                <Animated.View style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}>
                    <View style={styles.logoWrapper}>
                        <View style={styles.logoCircle}>
                            <Car size={60} color={COLORS.primary} />
                        </View>
                        <View style={styles.branding}>
                            <Text style={styles.brandTitle}>HELP MY CAR</Text>
                            <View style={styles.divider} />
                            <Text style={styles.tagline}>ON-DEMAND ROADSIDE RELIEF</Text>
                        </View>
                    </View>
                </Animated.View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    background: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.75)', // Deep dark overlay for premium feel
    },
    content: {
        alignItems: 'center',
    },
    logoWrapper: {
        alignItems: 'center',
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.large,
        marginBottom: 30,
    },
    branding: {
        alignItems: 'center',
    },
    brandTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: 2,
    },
    divider: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.primary,
        marginVertical: 12,
        borderRadius: 2,
    },
    tagline: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '700',
        letterSpacing: 3,
    },
});

export default SplashScreen;
