import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Eye, EyeOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { GOOGLE_CONFIG } from '../config';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
    const { login, googleLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');

    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: GOOGLE_CONFIG.webClientId,
        iosClientId: GOOGLE_CONFIG.iosClientId?.includes('YOUR_') ? GOOGLE_CONFIG.webClientId : GOOGLE_CONFIG.iosClientId,
        androidClientId: GOOGLE_CONFIG.androidClientId?.includes('YOUR_') ? GOOGLE_CONFIG.webClientId : GOOGLE_CONFIG.androidClientId,
    });

    useEffect(() => {
        if (response?.type === 'success') {
            // Expo auth session usually puts the token here
            const idToken = response.authentication?.idToken || response.params?.id_token;
            if (idToken) {
                handleGoogleLogin(idToken);
            } else {
                setGeneralError('Could not retrieve identity token from Google. Please try again.');
            }
        } else if (response?.type === 'error') {
            setGeneralError('Google login failed or was cancelled.');
        }
    }, [response]);

    const handleGoogleLogin = async (idToken) => {
        setGoogleLoading(true);
        setGeneralError('');
        try {
            await googleLogin(idToken);
        } catch (err) {
            setGeneralError(err.message || 'Google login failed');
        } finally {
            setGoogleLoading(false);
        }
    };


    const handleLogin = async () => {
        setEmailError('');
        setPasswordError('');
        setGeneralError('');

        let hasError = false;
        if (!email) {
            setEmailError('Email is required');
            hasError = true;
        }
        if (!password) {
            setPasswordError('Password is required');
            hasError = true;
        }

        if (hasError) return;

        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            const msg = String(err).replace('Error: ', '');
            if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('user not found')) {
                setEmailError(msg);
            } else if (msg.toLowerCase().includes('password')) {
                setPasswordError(msg);
            } else {
                setGeneralError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2000&auto=format&fit=crop' }}
                style={styles.background}
            >
                <View style={styles.overlay} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>HMC</Text>
                        </View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to your account</Text>
                    </View>

                    <View style={styles.formCard}>
                        <View style={styles.form}>
                            {!!generalError && (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{generalError}</Text>
                                </View>
                            )}

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email Address</Text>
                                <TextInput
                                    style={[styles.input, !!emailError && styles.inputError]}
                                    placeholder=""
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={(val) => { setEmail(val); setEmailError(''); setGeneralError(''); }}
                                />
                                {!!emailError && <Text style={styles.inlineErrorText}>{emailError}</Text>}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.passwordInputWrapper}>
                                    <TextInput
                                        style={[styles.input, styles.passwordInput, !!passwordError && styles.inputError]}
                                        placeholder=""
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={(val) => { setPassword(val); setPasswordError(''); setGeneralError(''); }}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} color={COLORS.textLight} />
                                        ) : (
                                            <Eye size={20} color={COLORS.textLight} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                {!!passwordError && <Text style={styles.inlineErrorText}>{passwordError}</Text>}
                            </View>

                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={styles.linkText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <Button
                                title="Sign In"
                                onPress={handleLogin}
                                loading={loading}
                                style={styles.loginButton}
                            />

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>OR</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                style={styles.googleButton}
                                onPress={() => promptAsync()}
                                disabled={!request || googleLoading}
                            >
                                <Image
                                    source={{ uri: 'https://authjs.dev/img/providers/google.svg' }}
                                    style={styles.googleIcon}
                                />
                                <Text style={styles.googleButtonText}>
                                    {googleLoading ? 'Connecting...' : 'Continue with Google'}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Don{"'"}t have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                    <Text style={[styles.linkText, styles.signUpLink]}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    keyboardView: {
        flex: 1,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        marginTop: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
        ...SHADOWS.medium,
    },
    logoText: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: '900',
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
    form: {
        width: '100%',
    },
    formCard: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
        ...SHADOWS.medium,
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
    passwordInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.xl,
    },
    linkText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    loginButton: {
        paddingVertical: 15,
        borderRadius: 14,
        ...SHADOWS.medium,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.xl,
    },
    footerText: {
        color: COLORS.textLight,
        fontSize: 14,
    },
    signUpLink: {
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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#EEEEEE',
    },
    dividerText: {
        marginHorizontal: SPACING.md,
        color: COLORS.textLight,
        fontSize: 12,
        fontWeight: '600',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        ...SHADOWS.small,
    },
    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
});

export default LoginScreen;
