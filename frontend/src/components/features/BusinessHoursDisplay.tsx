import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/src/constants/tokens';
import type { BusinessHoursRow } from '@/src/utils/businessHours';

interface BusinessHoursDisplayProps {
  rows: BusinessHoursRow[];
}

export function BusinessHoursDisplay({ rows }: BusinessHoursDisplayProps) {
  if (rows.length === 0) {
    return <Text style={styles.emptyText}>Horário não informado</Text>;
  }

  return (
    <View style={styles.container}>
      {rows.map((row) => (
        <View key={`${row.dayLabel}-${row.hoursLabel}`} style={styles.row}>
          <Text style={styles.dayLabel}>{row.dayLabel}</Text>
          <Text style={[styles.hoursLabel, row.isClosed && styles.closedLabel]}>
            {row.isClosed ? 'Fechado' : row.hoursLabel}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  dayLabel: {
    minWidth: 72,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  hoursLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    textAlign: 'right',
  },
  closedLabel: {
    color: colors.textMuted,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
