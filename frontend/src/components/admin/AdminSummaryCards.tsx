import { StyleSheet, Text, View } from 'react-native';

import type { AdminStoreSummary } from '@/src/types/store';

interface AdminSummaryCardsProps {
  summary?: AdminStoreSummary;
}

const cards = [
  {
    key: 'pending' as const,
    label: 'Pendentes',
    backgroundColor: '#FEF3C7',
    valueColor: '#B45309',
  },
  {
    key: 'active' as const,
    label: 'Ativos',
    backgroundColor: '#D1FAE5',
    valueColor: '#059669',
  },
  {
    key: 'rejected' as const,
    label: 'Recusados',
    backgroundColor: '#FEE2E2',
    valueColor: '#DC2626',
  },
];

export function AdminSummaryCards({ summary }: AdminSummaryCardsProps) {
  return (
    <View style={styles.row}>
      {cards.map((card) => (
        <View key={card.key} style={[styles.card, { backgroundColor: card.backgroundColor }]}>
          <Text style={[styles.value, { color: card.valueColor }]}>
            {summary?.[card.key] ?? 0}
          </Text>
          <Text style={styles.label}>{card.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  value: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  label: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
});
