import { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

const SplashScreen = ({ navigation }) => {
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            navigation.replace('Login');
        }, 2500);

        return () => clearTimeout(timer);
    }, [fadeAnim, navigation]);

    return (
        <View style={styles.container}>
            <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>HMC</Text>
                </View>
                <Text style={styles.title}>Help My Car</Text>
                <Text style={styles.tagline}>“Car Stuck? Help Is One Tap Away.”</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        width: 120,
        height: 120,
        backgroundColor: COLORS.white,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    logoText: {
        fontSize: 40,
        fontWeight: '900',
        color: COLORS.primary,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 10,
    },
    tagline: {
        fontSize: 16,
        color: COLORS.white,
        opacity: 0.9,
    },
});

export default SplashScreen;
