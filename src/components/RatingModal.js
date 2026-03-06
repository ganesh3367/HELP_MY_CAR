import { Star, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Animated, Dimensions, KeyboardAvoidingView, Modal,
    Platform, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

const { height } = Dimensions.get('window');

const RATING_LABELS = ['', 'Poor 😕', 'Fair 😐', 'Good 🙂', 'Great 😊', 'Excellent 🌟'];

const RatingModal = ({ visible, onClose, onSave, mechanicName }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const slideAnim = React.useRef(new Animated.Value(height)).current;

    // Slide up/down on visibility change
    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: visible ? 0 : height,
            useNativeDriver: true,
            bounciness: 4,
        }).start();
        if (!visible) {
            // Reset after animation
            const t = setTimeout(() => { setRating(0); setComment(''); }, 300);
            return () => clearTimeout(t);
        }
    }, [visible, slideAnim]);

    const handleSave = () => {
        if (rating === 0) return;
        onSave({ rating, comment: comment.trim() });
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableOpacity style={styles.backdrop} onPress={onClose} />

                <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
                    {/* Handle */}
                    <View style={styles.handle} />

                    {/* Close */}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <X size={22} color={COLORS.textLight} />
                    </TouchableOpacity>

                    {/* Emoji + Title */}
                    <Text style={styles.emoji}>⭐</Text>
                    <Text style={styles.title}>Rate your service</Text>
                    <Text style={styles.subtitle}>How was your experience with</Text>
                    <Text style={styles.mechanicName}>{mechanicName || 'Mechanic'}?</Text>

                    {/* Stars */}
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <TouchableOpacity key={s} onPress={() => setRating(s)} style={styles.starBtn}>
                                <Star
                                    size={46}
                                    color={s <= rating ? '#FFD700' : '#E0E0E0'}
                                    fill={s <= rating ? '#FFD700' : 'transparent'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Rating label */}
                    <Text style={[styles.ratingLabel, rating > 0 && { color: COLORS.primary }]}>
                        {rating > 0 ? RATING_LABELS[rating] : 'Tap to rate'}
                    </Text>

                    {/* Comment input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Share more about your experience (optional)"
                        placeholderTextColor={COLORS.textLight}
                        multiline
                        numberOfLines={3}
                        value={comment}
                        onChangeText={setComment}
                        textAlignVertical="top"
                    />

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitBtn, rating === 0 && styles.submitDisabled]}
                        onPress={handleSave}
                        disabled={rating === 0}
                    >
                        <Text style={styles.submitText}>
                            {rating === 0 ? 'Select a rating first' : 'Submit Feedback ✓'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
    sheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: SPACING.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : 28,
        alignItems: 'center',
        ...SHADOWS.large,
    },
    handle: { width: 44, height: 4, borderRadius: 2, backgroundColor: '#DDD', marginBottom: 16 },
    closeBtn: { position: 'absolute', top: 20, right: 22 },

    emoji: { fontSize: 44, marginBottom: 6 },
    title: { fontSize: 22, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
    subtitle: { fontSize: 14, color: COLORS.textLight },
    mechanicName: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginBottom: 20 },

    starsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    starBtn: { padding: 4 },

    ratingLabel: {
        fontSize: 15, fontWeight: '700', color: COLORS.textLight,
        marginBottom: 20, minHeight: 22,
    },

    input: {
        width: '100%',
        backgroundColor: '#F7F8FA',
        borderRadius: 16,
        padding: 16,
        fontSize: 15,
        color: COLORS.text,
        minHeight: 90,
        borderWidth: 1,
        borderColor: '#EBEBEB',
        marginBottom: 20,
    },

    submitBtn: {
        width: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    submitDisabled: { backgroundColor: '#CCC' },
    submitText: { fontSize: 17, fontWeight: '900', color: COLORS.white },
});

export default RatingModal;
