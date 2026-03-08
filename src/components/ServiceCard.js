import { MapPin, Navigation2, Phone, ShieldCheck, Star } from 'lucide-react-native';
import { Image, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

const ServiceCard = ({
    title,
    distance,
    rating,
    cost,
    phone,
    lat,
    lng,
    image,
    type = 'mechanic',
    onProceed
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
            <View style={styles.contentRow}>
                {/* Visual Section */}
                <View style={styles.imageWrapper}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.image} />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: type === 'mechanic' ? '#EBF5FF' : '#F5EFFF' }]}>
                            <Text style={{ fontSize: 24 }}>{type === 'mechanic' ? '🔧' : '🚛'}</Text>
                        </View>
                    )}
                    {rating && (
                        <View style={styles.ratingBadge}>
                            <Star size={10} color="#FFD700" fill="#FFD700" />
                            <Text style={styles.ratingText}>{rating}</Text>
                        </View>
                    )}
                </View>

                {/* Info Section */}
                <View style={styles.info}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={1}>{title}</Text>
                        <ShieldCheck size={16} color={COLORS.success} />
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Navigation2 size={12} color={COLORS.textLight} />
                            <Text style={styles.metaText}>{distance || 'Nearby'}</Text>
                        </View>
                        <View style={[styles.metaItem, { marginLeft: 12 }]}>
                            <View style={styles.dot} />
                            <Text style={styles.metaText}>{type === 'mechanic' ? 'Expert' : '24/7'}</Text>
                        </View>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>{type === 'mechanic' ? 'Est. Service' : 'Rate/km'}</Text>
                        <Text style={styles.priceValue}>
                            {cost ? (cost.toString().includes('₹') ? cost : `₹${cost}`) : '₹N/A'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Actions Row */}
            <View style={styles.actionRow}>
                {type === 'mechanic' ? (
                    <TouchableOpacity onPress={onProceed} style={styles.primaryAction}>
                        <Text style={styles.primaryActionText}>View Profile</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={makeCall} style={[styles.primaryAction, { backgroundColor: '#FF9500' }]}>
                        <Text style={styles.primaryActionText}>Request Tow</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.iconActions}>
                    <TouchableOpacity onPress={openMaps} style={styles.secondaryAction}>
                        <MapPin size={20} color={type === 'towing' ? '#FF9500' : COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={makeCall} style={[styles.secondaryAction, type === 'towing' ? styles.callActionTowing : styles.callAction]}>
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
        borderRadius: 24,
        padding: 16,
        marginVertical: 10,
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    contentRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: 85,
        height: 85,
        borderRadius: 18,
        backgroundColor: '#F0F2F5',
    },
    imagePlaceholder: {
        width: 85,
        height: 85,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ratingBadge: {
        position: 'absolute',
        bottom: -6,
        right: -6,
        backgroundColor: COLORS.white,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    ratingText: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.text,
        marginLeft: 3,
    },
    info: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    title: {
        fontSize: 17,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: -0.3,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CCD0D5',
    },
    priceRow: {
        marginTop: 4,
    },
    priceLabel: {
        fontSize: 11,
        color: COLORS.textLight,
        fontWeight: '600',
        marginBottom: 2,
    },
    priceValue: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.primary,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F2F4F7',
        paddingTop: 14,
    },
    primaryAction: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
        ...SHADOWS.small,
    },
    primaryActionText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '800',
    },
    iconActions: {
        flexDirection: 'row',
        gap: 10,
    },
    secondaryAction: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#F7F9FC',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#EDF0F5',
    },
    callAction: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    callActionTowing: {
        backgroundColor: '#FF9500',
        borderColor: '#FF9500',
    },
});

export default ServiceCard;
