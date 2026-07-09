import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/tokens';

interface CategoryChipProps {
  label: string;
  icon?: string;
  onPress?: () => void;
  selected?: boolean;
  compact?: boolean;
}

export function CategoryChip({
  label,
  icon,
  onPress,
  selected = false,
  compact = false,
}: CategoryChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, selected ? styles.selectedChip : styles.defaultChip]}
    >
      <Text
        style={[
          styles.label,
          compact && styles.compactLabel,
          selected ? styles.selectedLabel : styles.defaultLabel,
        ]}
      >
        {icon ? `${icon} ` : ''}
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  selectedChip: {
    backgroundColor: colors.primarySoft,
  },
  defaultChip: {
    backgroundColor: colors.neutralSoft,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  compactLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  selectedLabel: {
    color: colors.primary,
  },
  defaultLabel: {
    color: colors.textSecondary,
  },
});
