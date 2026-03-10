import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { COLORS, SHADOWS, SIZES, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const SignupScreen = ({ navigation, route }) => {
    const { signup } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState(route.params?.role || 'user');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (route.params?.role) {
            setRole(route.params.role);
        }
    }, [route.params?.role]);

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');

    const handleSignup = async () => {
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setGeneralError('');

        let hasError = false;
        if (!name) {
            setNameError('Name is required');
            hasError = true;
        }
        if (!email) {
            setEmailError('Email is required');
            hasError = true;
        }
        if (!password) {
            setPasswordError('Password is required');
            hasError = true;
        }
        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            hasError = true;
        }

        if (hasError) return;

        setLoading(true);
        try {
            await signup(name, email, password, role);
        } catch (error) {
            const msg = String(error).replace('Error: ', '');
            if (msg.toLowerCase().includes('email')) {
                setEmailError(msg);
            } else {
                setGeneralError(msg);
            }
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
                    <Text style={styles.title}>{role === 'garage' ? 'Business Account' : 'Create Account'}</Text>
                    <Text style={styles.subtitle}>
                        {role === 'garage'
                            ? 'Step 1: Create your owner login'
                            : 'Join our community of car owners'}
                    </Text>
                </View>

                <View style={styles.form}>
                    {!!generalError && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{generalError}</Text>
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={[styles.input, !!nameError && styles.inputError]}
                            placeholder="John Doe"
                            value={name}
                            onChangeText={(val) => { setName(val); setNameError(''); setGeneralError(''); }}
                        />
                        {!!nameError && <Text style={styles.inlineErrorText}>{nameError}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={[styles.input, !!emailError && styles.inputError]}
                            placeholder="john@example.com"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={(val) => { setEmail(val); setEmailError(''); setGeneralError(''); }}
                        />
                        {!!emailError && <Text style={styles.inlineErrorText}>{emailError}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={[styles.input, !!passwordError && styles.inputError]}
                            placeholder="Create a password"
                            secureTextEntry
                            value={password}
                            onChangeText={(val) => { setPassword(val); setPasswordError(''); setGeneralError(''); }}
                        />
                        {!!passwordError && <Text style={styles.inlineErrorText}>{passwordError}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={[styles.input, !!confirmPasswordError && styles.inputError]}
                            placeholder="Repeat password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={(val) => { setConfirmPassword(val); setConfirmPasswordError(''); setGeneralError(''); }}
                        />
                        {!!confirmPasswordError && <Text style={styles.inlineErrorText}>{confirmPasswordError}</Text>}
                    </View>

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
    sectionHeader: {
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    roleGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: SPACING.xl,
    },
    roleCard: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        padding: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        position: 'relative',
    },
    roleCardActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        ...SHADOWS.medium,
    },
    roleIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    roleCardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    roleCardSub: {
        fontSize: 11,
        color: COLORS.textLight,
        lineHeight: 15,
    },
    activeCheck: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
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
    specialtiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    specialtyChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    specialtyChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    specialtyChipText: {
        fontSize: 12,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    specialtyChipTextActive: {
        color: COLORS.white,
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
    errorContainer: {
        backgroundColor: COLORS.error + '10',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.error + '20',
    },
    errorText: {
        color: COLORS.error,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    inputError: {
        borderColor: COLORS.error + '80',
        backgroundColor: COLORS.error + '05',
    },
    inlineErrorText: {
        color: COLORS.error,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 6,
        marginLeft: 4,
    },
});

export default SignupScreen;
