import { MapPin, Phone, Star } from 'lucide-react-native';
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS, SIZES, SPACING } from '../constants/theme';

const ServiceCard = ({
    title,
    distance,
    rating,
    cost,
    phone,
    lat,
    lng,
    type = 'mechanic' // or 'towing'
}) => {
    const openMaps = () => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const label = title;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        Linking.openURL(url);
    };

    const makeCall = () => {
        Linking.openURL(`tel:${phone}`);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.row}>
                        <MapPin size={14} color={COLORS.textLight} />
                        <Text style={styles.distance}>{distance}</Text>
                    </View>
                </View>
                {rating && (
                    <View style={styles.ratingContainer}>
                        <Star size={14} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.ratingText}>{rating}</Text>
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <View>
                    <Text style={styles.costLabel}>{type === 'mechanic' ? 'Est. Cost' : 'Cost/km'}</Text>
                    <Text style={styles.costValue}>{cost}</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity onPress={openMaps} style={styles.iconButton}>
                        <MapPin size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={makeCall} style={[styles.iconButton, styles.callButton]}>
                        <Phone size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SPACING.md,
        marginVertical: SPACING.sm,
        ...SHADOWS.medium,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    distance: {
        fontSize: 14,
        color: COLORS.textLight,
        marginLeft: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#CC9900',
        marginLeft: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: SPACING.md,
    },
    costLabel: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    costValue: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },
    actions: {
        flexDirection: 'row',
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF5E6',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.sm,
    },
    callButton: {
        backgroundColor: COLORS.primary,
    },
});

export default ServiceCard;
