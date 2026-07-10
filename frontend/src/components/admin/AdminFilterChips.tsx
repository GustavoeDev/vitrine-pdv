import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors } from '@/src/constants/tokens';
import type { AdminStoreFilter } from '@/src/types/store';

const filters: { key: AdminStoreFilter; label: string }[] = [
  { key: 'PENDING', label: 'Pendentes' },
  { key: 'ACTIVE', label: 'Ativos' },
  { key: 'INACTIVE', label: 'Inativos' },
  { key: 'REJECTED', label: 'Recusados' },
];

interface AdminFilterChipsProps {
  activeFilter: AdminStoreFilter;
  onChange: (filter: AdminStoreFilter) => void;
}

export function AdminFilterChips({ activeFilter, onChange }: AdminFilterChipsProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {filters.map((filter) => {
        const isActive = filter.key === activeFilter;

        return (
          <Pressable
            key={filter.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(filter.key)}
            style={[styles.chip, isActive ? styles.activeChip : styles.inactiveChip]}
          >
            <Text style={[styles.chipText, isActive ? styles.activeText : styles.inactiveText]}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  activeChip: {
    backgroundColor: colors.primary,
  },
  inactiveChip: {
    backgroundColor: '#F3F4F6',
  },
  chipText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  activeText: {
    color: colors.white,
  },
  inactiveText: {
    color: '#6B7280',
  },
});
