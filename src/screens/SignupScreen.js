import { ArrowLeft, Car, Wrench } from 'lucide-react-native';
import { useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Button from '../components/Button';
import { COLORS, SHADOWS, SIZES, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const SignupScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user'); // 'user' or 'garage'
    const [garageName, setGarageName] = useState('');
    const [garageAddress, setGarageAddress] = useState('');
    const [garagePhone, setGaragePhone] = useState('');

    const { signup } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill all basic fields');
            return;
        }

        if (role === 'garage') {
            if (!garageName || !garageAddress || !garagePhone) {
                Alert.alert('Error', 'Please fill all garage details to register as a service provider');
                return;
            }
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await signup(name, email, password, role, {
                garageName,
                address: garageAddress,
                phone: garagePhone
            });
        } catch (error) {
            Alert.alert('Signup Failed', String(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <ArrowLeft size={24} color={COLORS.text} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join &quot;Help My Car&quot; community</Text>
                </View>

                {/* Role Switcher */}
                <View style={styles.roleContainer}>
                    <TouchableOpacity
                        style={[styles.roleButton, role === 'user' && styles.roleButtonActive]}
                        onPress={() => setRole('user')}
                        activeOpacity={0.8}
                    >
                        <Car size={20} color={role === 'user' ? COLORS.white : COLORS.textLight} style={styles.roleIcon} />
                        <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Regular User</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.roleButton, role === 'garage' && styles.roleButtonActive]}
                        onPress={() => setRole('garage')}
                        activeOpacity={0.8}
                    >
                        <Wrench size={20} color={role === 'garage' ? COLORS.white : COLORS.textLight} style={styles.roleIcon} />
                        <Text style={[styles.roleText, role === 'garage' && styles.roleTextActive]}>Garage Owner</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="john@example.com"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Create a password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Repeat password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                    {/* Dynamic Garage Fields */}
                    {role === 'garage' && (
                        <View style={styles.garageSection}>
                            <Text style={styles.sectionTitle}>Garage Details</Text>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Garage Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Super Fix Garage"
                                    value={garageName}
                                    onChangeText={setGarageName}
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Street Address</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="123 Main St, City"
                                    value={garageAddress}
                                    onChangeText={setGarageAddress}
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Phone Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="+1234567890"
                                    keyboardType="phone-pad"
                                    value={garagePhone}
                                    onChangeText={setGaragePhone}
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.termsContainer}>
                        <Text style={styles.termsText}>
                            By signing up, you agree to our{' '}
                            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                            <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>
                    </View>

                    <Button
                        title="Create Account"
                        onPress={handleSignup}
                        loading={loading}
                        style={styles.signupButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.linkText, styles.loginLink]}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    backButton: {
        padding: SPACING.lg,
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        left: 10,
        zIndex: 10,
    },
    scrollContent: {
        padding: SPACING.xl,
        paddingTop: 100,
    },
    header: {
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        marginTop: 4,
    },
    roleContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: 4,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: '#EEEEEE'
    },
    roleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: SIZES.radius - 2,
    },
    roleButtonActive: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.small,
    },
    roleIcon: {
        marginRight: 8,
    },
    roleText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textLight,
    },
    roleTextActive: {
        color: COLORS.white,
    },
    garageSection: {
        backgroundColor: '#F8F9FA',
        padding: SPACING.md,
        borderRadius: SIZES.radius,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    termsContainer: {
        marginVertical: SPACING.lg,
    },
    termsText: {
        fontSize: 12,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLink: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    signupButton: {
        paddingVertical: 15,
        borderRadius: 14,
        ...SHADOWS.medium,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    footerText: {
        color: COLORS.textLight,
        fontSize: 14,
    },
    linkText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    loginLink: {
        textDecorationLine: 'underline',
    },
});

export default SignupScreen;
