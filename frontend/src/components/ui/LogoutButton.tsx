import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/tokens';

interface LogoutButtonProps {
  onPress: () => void;
}

export function LogoutButton({ onPress }: LogoutButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
      <Ionicons color={colors.danger} name="log-out-outline" size={20} />
      <Text style={styles.label}>Sair da conta</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: spacing.lg,
  },
  label: {
    color: colors.danger,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
});
