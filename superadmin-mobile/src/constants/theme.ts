export const colors = {
  primary: '#84A98C',
  primaryLight: '#A3C4AC',
  primaryDark: '#5E7D65',
  secondary: '#FAF7F2',
  accent: '#52796F',
  background: '#F8F8F6',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E8E8E5',
  borderLight: '#F2F2F0',
  divider: '#E8E8E5',
  textPrimary: '#2F3A36',
  textSecondary: '#6B7A74',
  textTertiary: '#A0ACA6',
  placeholder: '#BAC4BF',
  disabledText: '#D1D9D5',
  disabledSurface: '#F0F2F1',
  overlay: 'rgba(47, 58, 54, 0.4)',
  success: '#34C759',
  successBackground: '#E8F5E9',
  warning: '#FF9500',
  warningBackground: '#FFF3E0',
  error: '#FF3B30',
  errorBackground: '#FFEBEE',
  info: '#007AFF',
  infoBackground: '#E3F2FD',
};

export const typography = {
  family: {
    regular: 'System', // Fallback to System until Inter is linked
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  size: {
    displayLg: 48,
    displayMd: 40,
    headingXl: 32,
    headingLg: 28,
    headingMd: 24,
    headingSm: 20,
    title: 18,
    subtitle: 16,
    bodyLarge: 16,
    body: 14,
    bodySmall: 13,
    caption: 12,
    label: 11,
    button: 15,
    overline: 10,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24, // Aliasing 2xl
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  pill: 9999,
  circle: 9999,
};

export const sizes = {
  inputHeight: 48,
  buttonHeight: 48,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  sizes,
  shadows,
};
