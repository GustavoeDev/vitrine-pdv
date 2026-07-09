import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/src/constants/tokens';

interface BottomSheetOptionProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  subtitle?: string;
  title: string;
  destructive?: boolean;
  showChevron?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function BottomSheetOption({
  destructive = false,
  icon,
  onPress,
  showChevron = true,
  style,
  subtitle,
  title,
}: BottomSheetOptionProps) {
  const iconColor = destructive ? colors.danger : colors.primary;
  const iconBackground = destructive ? '#FEE2E2' : colors.primarySoft;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.option, style]}
    >
      <View style={[styles.optionIconWrap, { backgroundColor: iconBackground }]}>
        <Ionicons color={iconColor} name={icon} size={20} />
      </View>
      <View style={styles.optionTextWrap}>
        <Text style={[styles.optionTitle, destructive && styles.destructiveTitle]}>{title}</Text>
        {subtitle ? <Text style={styles.optionSubtitle}>{subtitle}</Text> : null}
      </View>
      {showChevron ? (
        <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  optionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextWrap: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  destructiveTitle: {
    color: colors.danger,
  },
  optionSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
});
