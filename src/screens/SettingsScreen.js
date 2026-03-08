import { ArrowLeft, Bell, ChevronRight, Eye, Moon, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

const SettingsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [locationSharing, setLocationSharing] = useState(true);

    const SettingItem = ({ icon: Icon, title, subtitle, value, onToggle, onPress, type = 'toggle' }) => (
        <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
                <Icon size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {type === 'toggle' ? (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: '#D1D1D1', true: COLORS.primary + '80' }}
                    thumbColor={value ? COLORS.primary : '#F4F3F4'}
                />
            ) : (
                <TouchableOpacity onPress={onPress}>
                    <ChevronRight size={20} color={COLORS.textLight} />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General</Text>
                    <SettingItem
                        icon={Bell}
                        title="Push Notifications"
                        subtitle="Get updates on your service status"
                        value={notifications}
                        onToggle={setNotifications}
                    />
                    <SettingItem
                        icon={Moon}
                        title="Dark Mode"
                        subtitle="Reduce eye strain at night"
                        value={darkMode}
                        onToggle={setDarkMode}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Privacy</Text>
                    <SettingItem
                        icon={Eye}
                        title="Location Sharing"
                        subtitle="Share location for easier booking"
                        value={locationSharing}
                        onToggle={setLocationSharing}
                    />
                    <SettingItem
                        icon={Shield}
                        title="Data Privacy"
                        subtitle="Manage your personal data"
                        type="link"
                        onPress={() => navigation.navigate('PrivacySafety')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <TouchableOpacity style={styles.aboutRow}>
                        <Text style={styles.aboutLabel}>Version</Text>
                        <Text style={styles.aboutValue}>1.2.0 (Build 45)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.aboutRow}>
                        <Text style={styles.aboutLabel}>Terms of Service</Text>
                        <ChevronRight size={18} color={COLORS.textLight} />
                    </TouchableOpacity>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    },
    backButton: {
        marginRight: SPACING.lg,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    scrollContent: {
        padding: SPACING.lg,
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
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 16,
        marginBottom: SPACING.sm,
        ...SHADOWS.small,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: COLORS.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    settingSubtitle: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },
    aboutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 16,
        marginBottom: SPACING.sm,
        ...SHADOWS.small,
    },
    aboutLabel: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '500',
    },
    aboutValue: {
        fontSize: 14,
        color: COLORS.textLight,
    },
});

export default SettingsScreen;
