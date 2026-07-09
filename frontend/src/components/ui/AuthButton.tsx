import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/constants/tokens';

interface AuthButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
}

export function AuthButton({ label, onPress, variant = 'primary', disabled = false }: AuthButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primaryButton : styles.outlineButton,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.outlineLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 56,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  outlineButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    ...typography.button,
  },
  primaryLabel: {
    color: colors.white,
  },
  outlineLabel: {
    color: colors.primary,
  },
});
