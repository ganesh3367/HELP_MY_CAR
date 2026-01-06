export const COLORS = {
  primary: '#FF8C00', // Dark Orange
  secondary: '#FFA500', // Orange
  accent: '#FFD700', // Gold
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#333333',
  textLight: '#777777',
  white: '#FFFFFF',
  error: '#FF3B30',
  success: '#34C759',
  shadow: '#000000',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const SIZES = {
  radius: 16,
  padding: 20,
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
