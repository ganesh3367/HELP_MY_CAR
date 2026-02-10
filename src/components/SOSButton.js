import { PhoneCall } from 'lucide-react-native';
import { useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

const SOSButton = ({ onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scale, {
            toValue: 0.9,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={1}
                style={styles.button}
            >
                <PhoneCall size={32} color={COLORS.white} />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 110,
        right: 20,
        ...SHADOWS.medium,
    },
    button: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FF3B30',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#FFEBEA',
    },
});

export default SOSButton;
