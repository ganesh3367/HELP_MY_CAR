import { ChevronRight, Info, MessageSquare, Phone } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

const ProfileScreen = () => {
    const MenuItem = ({ icon: Icon, title, subtitle, onPress }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIcon}>
                <Icon size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <ChevronRight size={20} color={COLORS.textLight} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>Help & Profile</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Emergency Support</Text>
                    <MenuItem
                        icon={Phone}
                        title="Emergency Numbers"
                        subtitle="Police, Ambulance, Fire"
                    />
                    <MenuItem
                        icon={MessageSquare}
                        title="Send Feedback"
                        subtitle="Help us improve"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About App</Text>
                    <MenuItem
                        icon={Info}
                        title="App Info"
                        subtitle="Version 1.0.0"
                    />
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
    scroll: {
        padding: SPACING.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xl,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textLight,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 16,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#FFF5E6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    menuSubtitle: {
        fontSize: 12,
        color: COLORS.textLight,
    },
});

export default ProfileScreen;
