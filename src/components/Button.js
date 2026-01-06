import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SPACING } from '../constants/theme';

const Button = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    style,
    textStyle,
    disabled = false
}) => {
    const isSecondary = variant === 'secondary';
    const isOutline = variant === 'outline';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.container,
                isSecondary && styles.secondary,
                isOutline && styles.outline,
                disabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={isOutline ? COLORS.primary : COLORS.white} />
            ) : (
                <Text
                    style={[
                        styles.text,
                        isOutline && styles.textOutline,
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    secondary: {
        backgroundColor: COLORS.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    disabled: {
        backgroundColor: '#CCCCCC',
        borderColor: '#CCCCCC',
    },
    text: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    textOutline: {
        color: COLORS.primary,
    },
});

export default Button;
