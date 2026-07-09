import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/tokens';

interface CategoryChipProps {
  label: string;
  icon?: string;
  iconOutline?: string;
  onPress?: () => void;
  selected?: boolean;
  compact?: boolean;
}

export function CategoryChip({
  label,
  icon,
  iconOutline,
  onPress,
  selected = false,
  compact = false,
}: CategoryChipProps) {
  const iconName = (selected ? icon : iconOutline ?? icon) as keyof typeof Ionicons.glyphMap | undefined;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, selected ? styles.selectedChip : styles.defaultChip]}
    >
      <View style={styles.content}>
        {iconName ? (
          <Ionicons
            color={selected ? colors.primary : colors.textSecondary}
            name={iconName}
            size={compact ? 15 : 16}
          />
        ) : null}
        <Text
          style={[
            styles.label,
            compact && styles.compactLabel,
            selected ? styles.selectedLabel : styles.defaultLabel,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
