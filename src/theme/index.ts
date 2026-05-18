export const Colors = {
  // Brand
  primary: '#6366F1',
  primaryContainer: '#EEF2FF',
  secondary: '#10B981',
  secondaryContainer: '#ECFDF5',
  accent: '#F59E0B',
  family: '#8B5CF6',

  // Risk levels
  riskLow: '#10B981',
  riskLowBg: '#ECFDF5',
  riskWarning: '#F59E0B',
  riskWarningBg: '#FFFBEB',
  riskHigh: '#EF4444',
  riskHighBg: '#FEF2F2',
  riskCritical: '#7C3AED',
  riskCriticalBg: '#F5F3FF',

  // Surface
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  textLink: '#6366F1',

  // Streak / gamification
  streak: '#F59E0B',
  streakBg: '#FFF7ED',
  onPrimaryContainer: '#4338CA',

  // Semantic
  error: '#EF4444',
  errorContainer: '#FEF2F2',
  success: '#10B981',
  successContainer: '#ECFDF5',
  warning: '#F59E0B',
  warningContainer: '#FFFBEB',

  // Gradients (used as array for LinearGradient)
  heroGradientStart: '#6366F1',
  heroGradientEnd: '#8B5CF6',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.04)',
} as const;

export const Typography = {
  scoreHero: { fontSize: 64, fontWeight: '800' as const, lineHeight: 72 },
  titleXL: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  titleLG: { fontSize: 22, fontWeight: '700' as const, lineHeight: 30 },
  titleMD: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  titleSM: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  bodyLG: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMD: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySM: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
  labelLG: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  labelMD: { fontSize: 12, fontWeight: '600' as const, lineHeight: 18 },
  labelSM: { fontSize: 11, fontWeight: '600' as const, lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: '400' as const, lineHeight: 16 },
  eyebrow: { fontSize: 11, fontWeight: '700' as const, lineHeight: 16, letterSpacing: 1 },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

export const Motion = {
  tap: 150,
  state: 200,
  screen: 300,
  badge: 400,
} as const;
