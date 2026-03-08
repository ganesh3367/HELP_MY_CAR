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
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.md,
        marginTop: SPACING.lg,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginBottom: SPACING.xl,
    },
    input: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.md,
        fontSize: 15,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        minHeight: 150,
        ...SHADOWS.small,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        borderRadius: 18,
        marginTop: SPACING.xl * 1.5,
        ...SHADOWS.medium,
    },
    submitText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FeedbackScreen;
