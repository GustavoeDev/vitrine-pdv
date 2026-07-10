import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing } from '@/src/constants/tokens';

interface SeeMoreLinkProps {
  label?: string;
  onPress: () => void;
}

export function SeeMoreLink({ label = 'Ver mais', onPress }: SeeMoreLinkProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
      <Text style={styles.text}>{label}</Text>
      <Ionicons color={colors.primary} name="arrow-forward" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  text: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
});
