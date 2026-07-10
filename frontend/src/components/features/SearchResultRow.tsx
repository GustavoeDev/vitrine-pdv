import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/tokens';
import { SearchResult } from '@/src/types';

interface SearchResultRowProps {
  result: SearchResult;
  showIcon?: boolean;
  isLast?: boolean;
  onPress?: () => void;
}

export function SearchResultRow({
  result,
  showIcon = true,
  isLast = false,
  onPress,
}: SearchResultRowProps) {
  const isStore = result.type === 'store';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.row, !isLast && styles.withBorder]}
    >
      {showIcon ? (
        <View style={[styles.iconWrap, isStore ? styles.primaryIconWrap : styles.mutedIconWrap]}>
          <Ionicons
            color={isStore ? colors.primary : colors.textSecondary}
            name={isStore ? 'storefront-outline' : 'cube-outline'}
            size={18}
          />
        </View>
      ) : null}
      <View style={styles.textContent}>
        <Text style={styles.title}>{result.title}</Text>
        <Text style={styles.subtitle}>{result.subtitle}</Text>
      </View>
      <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: spacing.sm,
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryIconWrap: {
    backgroundColor: colors.primarySoft,
  },
  mutedIconWrap: {
    backgroundColor: colors.neutralSoft,
  },
  textContent: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
});
