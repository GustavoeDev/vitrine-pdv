import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { createIntervalId } from '@/src/constants/establishment';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { DaySchedule, TimeInterval } from '@/src/types/establishment';
import { getWeekdayLabel } from '@/src/utils/establishmentRegistration';

interface BusinessHoursDayCardProps {
  schedule: DaySchedule;
  onChange: (schedule: DaySchedule) => void;
}

export function BusinessHoursDayCard({ schedule, onChange }: BusinessHoursDayCardProps) {
  const toggleDay = (enabled: boolean) => {
    onChange({
      ...schedule,
      enabled,
      intervals: enabled
        ? schedule.intervals.length > 0
          ? schedule.intervals
          : [{ id: createIntervalId(), open: '', close: '' }]
        : schedule.intervals,
    });
  };

  const updateInterval = (intervalId: string, patch: Partial<TimeInterval>) => {
    onChange({
      ...schedule,
      intervals: schedule.intervals.map((interval) =>
        interval.id === intervalId ? { ...interval, ...patch } : interval,
      ),
    });
  };

  const addInterval = () => {
    onChange({
      ...schedule,
      intervals: [...schedule.intervals, { id: createIntervalId(), open: '', close: '' }],
    });
  };

  const removeInterval = (intervalId: string) => {
    const nextIntervals = schedule.intervals.filter((interval) => interval.id !== intervalId);

    onChange({
      ...schedule,
      intervals:
        nextIntervals.length > 0
          ? nextIntervals
          : [{ id: createIntervalId(), open: '', close: '' }],
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.dayLabel}>{getWeekdayLabel(schedule.day)}</Text>
        <Switch
          ios_backgroundColor={colors.border}
          onValueChange={toggleDay}
          thumbColor={colors.white}
          trackColor={{ false: colors.border, true: colors.primary }}
          value={schedule.enabled}
        />
      </View>

      {schedule.enabled ? (
        <View style={styles.body}>
          {schedule.intervals.map((interval) => (
            <View key={interval.id} style={styles.intervalRow}>
              <Text style={styles.intervalLabel}>Abre às</Text>
              <TextInput
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                onChangeText={(value) => updateInterval(interval.id, { open: value })}
                placeholder="08:00"
                placeholderTextColor={colors.textMuted}
                style={styles.timeInput}
                value={interval.open}
              />
              <Text style={styles.intervalLabel}>Fecha às</Text>
              <TextInput
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                onChangeText={(value) => updateInterval(interval.id, { close: value })}
                placeholder="18:00"
                placeholderTextColor={colors.textMuted}
                style={styles.timeInput}
                value={interval.close}
              />
              {schedule.intervals.length > 1 ? (
                <Pressable
                  accessibilityLabel="Remover intervalo"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => removeInterval(interval.id)}
                >
                  <Ionicons color={colors.textMuted} name="trash-outline" size={18} />
                </Pressable>
              ) : (
                <View style={styles.trashPlaceholder} />
              )}
            </View>
          ))}

          <Pressable
            accessibilityRole="button"
            onPress={addInterval}
            style={styles.addIntervalButton}
          >
            <Ionicons color={colors.primary} name="add" size={10} />
            <Text style={styles.addIntervalText}>Adicionar intervalo</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radius.lg - 4,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
    paddingBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  dayLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
  },
  body: {
    gap: spacing.sm,
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    minHeight: 32,
    gap: 6,
  },
  intervalLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  timeInput: {
    width: 80,
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    color: colors.textPrimary,
    fontSize: 12,
    textAlign: 'center',
    backgroundColor: colors.background,
  },
  trashPlaceholder: {
    width: 18,
    height: 18,
  },
  addIntervalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  addIntervalText: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
});
