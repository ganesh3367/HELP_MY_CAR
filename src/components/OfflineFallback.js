import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

const OfflineFallback = () => {
    const [isConnected, setIsConnected] = useState(true);
    const slideAnim = new Animated.Value(-100);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);

            Animated.timing(slideAnim, {
                toValue: state.isConnected ? -100 : 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });

        return () => unsubscribe();
    }, [slideAnim]);

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.banner}>
                <WifiOff size={16} color={COLORS.white} />
                <Text style={styles.text}>You are currently offline. Some features may not work.</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF3B30',
        padding: SPACING.md,
        borderRadius: 12,
        gap: 10,
    },
    text: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
});

export default OfflineFallback;
