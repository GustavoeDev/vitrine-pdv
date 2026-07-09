export const colors = {
  primary: '#F97316',
  primarySoft: '#FFF7ED',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  neutralSoft: '#F3F4F6',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  danger: '#EF4444',
  shadow: 'rgba(0, 0, 0, 0.08)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 999,
} as const;

export const typography = {
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  button: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  logo: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  splashTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
} as const;
