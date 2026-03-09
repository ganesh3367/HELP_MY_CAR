import { ArrowLeft, Send, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';

const FeedbackScreen = ({ navigation }) => {
    const { submitFeedback } = useAppContext();
    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) {
            Alert.alert('Error', 'Please enter your feedback message.');
            return;
        }

        setLoading(true);
        const success = await submitFeedback({ message, rating });
        setLoading(false);

        if (success) {
            Alert.alert('Success', 'Thank you for your feedback! It helps us improve Help My Car.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Error', 'Failed to submit feedback. Please try again later.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ArrowLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Send Feedback</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.label}>How do you rate your experience?</Text>
                    <View style={styles.ratingContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Star
                                    size={40}
                                    color={star <= rating ? '#FFD700' : '#E0E0E0'}
                                    fill={star <= rating ? '#FFD700' : 'transparent'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Tell us more</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="What can we improve? What do you like about the app?"
                        placeholderTextColor={COLORS.textLight}
                        multiline
                        numberOfLines={6}
                        value={message}
                        onChangeText={setMessage}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, loading && { opacity: 0.7 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Send size={20} color={COLORS.white} />
                                <Text style={styles.submitText}>Submit Feedback</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingTop: Platform.OS === 'ios' ? 20 : SPACING.xl,
        paddingBottom: SPACING.xl,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111827',
        letterSpacing: -0.5,
    },
    scrollContent: {
        padding: SPACING.xl,
    },
    label: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
        marginBottom: SPACING.lg,
        marginTop: SPACING.md,
        letterSpacing: -0.3,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: SPACING.xxl,
        backgroundColor: COLORS.white,
        paddingVertical: 24,
        borderRadius: 24,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    input: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        fontSize: 16,
        color: '#111827',
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
        minHeight: 160,
        ...SHADOWS.small,
        elevation: 2,
    },
    submitButton: {
        backgroundColor: '#111827',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 20,
        borderRadius: 20,
        marginTop: 40,
        ...SHADOWS.medium,
        elevation: 6,
    },
    submitText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});

export default FeedbackScreen;
