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
                        placeholder=""
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
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        padding: SPACING.xl,
        paddingBottom: Platform.OS === 'ios' ? 44 : 32,
        alignItems: 'center',
        ...SHADOWS.large,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    handle: { width: 50, height: 5, borderRadius: 2.5, backgroundColor: '#E5E7EB', marginBottom: 20 },
    closeBtn: { position: 'absolute', top: 24, right: 24, width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },

    emoji: { fontSize: 48, marginBottom: 8 },
    title: { fontSize: 26, fontWeight: '900', color: '#111827', marginBottom: 6, letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: COLORS.textLight, fontWeight: '500' },
    mechanicName: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginBottom: 24 },

    starsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    starBtn: { padding: 4 },

    ratingLabel: {
        fontSize: 15, fontWeight: '800', color: COLORS.textLight,
        marginBottom: 24, minHeight: 22, textTransform: 'uppercase', letterSpacing: 1,
    },

    input: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        padding: 20,
        fontSize: 16,
        color: '#111827',
        minHeight: 120,
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
        marginBottom: 24,
    },

    submitBtn: {
        width: '100%',
        backgroundColor: '#111827',
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: 'center',
        ...SHADOWS.medium,
        elevation: 6,
    },
    submitDisabled: { backgroundColor: '#E5E7EB', elevation: 0 },
    submitText: { fontSize: 17, fontWeight: '800', color: COLORS.white, letterSpacing: 0.5 },
});

export default RatingModal;
