import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    
    
    console.error('[Fatal UI Error]', error, info?.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const message = this.state.error?.message || 'Something went wrong.';
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>App Error</Text>
          <Text style={styles.subtitle}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry} activeOpacity={0.9}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  button: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },
});

