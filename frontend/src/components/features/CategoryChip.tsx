import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/tokens';

interface CategoryChipProps {
  label: string;
  icon?: string;
  iconOutline?: string;
  photoUrl?: string | null;
  onPress?: () => void;
  selected?: boolean;
  compact?: boolean;
}

export function CategoryChip({
  label,
  icon,
  iconOutline,
  photoUrl,
  onPress,
  selected = false,
  compact = false,
}: CategoryChipProps) {
  const iconName = (selected ? icon : iconOutline ?? icon) as
    | keyof typeof Ionicons.glyphMap
    | undefined;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, selected ? styles.selectedChip : styles.defaultChip]}
    >
      <View style={styles.content}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={[styles.photo, compact && styles.compactPhoto]} />
        ) : iconName ? (
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
  photo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.neutralSoft,
  },
  compactPhoto: {
    width: 18,
    height: 18,
    borderRadius: 9,
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
