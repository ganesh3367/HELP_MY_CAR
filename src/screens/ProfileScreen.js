import { ChevronRight, History, Info, LogOut, MessageSquare, Phone, Settings, Shield } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
    const { logout, user } = useAuth();

    const MenuItem = ({ icon: Icon, title, subtitle, onPress, color = COLORS.primary, destructive = false }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIcon, { backgroundColor: destructive ? '#FFEBEA' : '#FFF5E6' }]}>
                <Icon size={20} color={destructive ? COLORS.error : color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.menuTitle, destructive && { color: COLORS.error }]}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <ChevronRight size={20} color={COLORS.textLight} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                    </View>
                    <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                    <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <MenuItem
                        icon={History}
                        title="Service History"
                        subtitle="Your previous requests"
                        onPress={() => navigation.navigate('ServiceHistory')}
                    />
                    <MenuItem icon={Shield} title="Privacy & Safety" subtitle="Manage your data" />
                    <MenuItem icon={Settings} title="Settings" subtitle="App preferences" />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <MenuItem icon={Phone} title="Emergency Numbers" subtitle="Police, Ambulance, Fire" />
                    <MenuItem icon={MessageSquare} title="Send Feedback" subtitle="Help us improve" />
                    <MenuItem icon={Info} title="App Info" subtitle="Version 1.2.0" />
                </View>

                <View style={styles.section}>
                    <MenuItem icon={LogOut} title="Sign Out" onPress={logout} destructive />
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
    profileHeader: {
        alignItems: 'center',
        marginBottom: SPACING.xl * 1.5,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
        ...SHADOWS.medium,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    profileEmail: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    section: {
        marginBottom: SPACING.lg,
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
