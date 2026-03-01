import { Star, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import Button from './Button';

const RatingModal = ({ visible, onClose, onSave, mechanicName }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSave = () => {
        if (rating === 0) return;
        onSave({ rating, comment });
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <X size={24} color={COLORS.textLight} />
                    </TouchableOpacity>

                    <Text style={styles.title}>Rate your service</Text>
                    <Text style={styles.subtitle}>How was your experience with {mechanicName}?</Text>

                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <TouchableOpacity key={s} onPress={() => setRating(s)}>
                                <Star
                                    size={40}
                                    color={s <= rating ? '#FFD700' : '#E0E0E0'}
                                    fill={s <= rating ? '#FFD700' : 'transparent'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Write a comment (optional)..."
                        multiline
                        numberOfLines={4}
                        value={comment}
                        onChangeText={setComment}
                    />

                    <Button
                        title="Submit Rating"
                        onPress={handleSave}
                        disabled={rating === 0}
                        style={styles.submitBtn}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: SPACING.xl,
        width: '100%',
        alignItems: 'center',
        ...SHADOWS.large,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 10,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    stars: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 15,
        fontSize: 15,
        color: COLORS.text,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    submitBtn: {
        width: '100%',
        borderRadius: 14,
    }
});

export default RatingModal;
