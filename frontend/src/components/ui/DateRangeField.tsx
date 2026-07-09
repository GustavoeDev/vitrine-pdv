import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheetModal } from '@/src/components/ui/BottomSheetModal';
import { colors, radius, spacing, typography } from '@/src/constants/tokens';
import { formatDatePtBr } from '@/src/utils/dates';

type ActivePicker = 'start' | 'end' | null;

interface DateRangeFieldProps {
  label: string;
  startDate: Date | null;
  endDate: Date | null;
  onChangeStart: (date: Date) => void;
  onChangeEnd: (date: Date) => void;
  disabled?: boolean;
}

function resolvePickerDisplay(): 'inline' | 'calendar' | 'spinner' {
  if (Platform.OS === 'ios') {
    return 'inline';
  }

  if (Platform.OS === 'android') {
    return 'calendar';
  }

  return 'spinner';
}

export function DateRangeField({
  label,
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
  disabled = false,
}: DateRangeFieldProps) {
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [draftDate, setDraftDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!activePicker) {
      return;
    }

    if (activePicker === 'start' && startDate) {
      setDraftDate(startDate);
      return;
    }

    if (activePicker === 'end' && endDate) {
      setDraftDate(endDate);
    }
  }, [activePicker, endDate, startDate]);

  const minimumEndDate = startDate ?? new Date();
  const pickerTitle = activePicker === 'start' ? 'Data inicial' : 'Data final';
  const pickerMinimumDate = activePicker === 'end' ? minimumEndDate : new Date();

  const handleOpenPicker = (picker: Exclude<ActivePicker, null>) => {
    if (disabled) {
      return;
    }

    setActivePicker(picker);
  };

  const handleConfirm = () => {
    if (activePicker === 'start') {
      onChangeStart(draftDate);

      if (endDate && draftDate > endDate) {
        onChangeEnd(draftDate);
      }
    }

    if (activePicker === 'end') {
      onChangeEnd(draftDate);
    }

    setActivePicker(null);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setActivePicker(null);

    if (event.type !== 'set' || !selectedDate) {
      return;
    }

    if (activePicker === 'start') {
      onChangeStart(selectedDate);

      if (endDate && selectedDate > endDate) {
        onChangeEnd(selectedDate);
      }

      return;
    }

    if (activePicker === 'end') {
      onChangeEnd(selectedDate);
    }
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => handleOpenPicker('start')}
          style={[styles.dateInput, disabled && styles.disabledInput]}
        >
          <Text style={styles.dateLabel}>Início</Text>
          <View style={styles.dateValueRow}>
            <Ionicons color={colors.primary} name="calendar-outline" size={18} />
            <Text style={[styles.dateValue, !startDate && styles.placeholder]}>
              {startDate ? formatDatePtBr(startDate) : 'Selecionar'}
            </Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => handleOpenPicker('end')}
          style={[styles.dateInput, disabled && styles.disabledInput]}
        >
          <Text style={styles.dateLabel}>Fim</Text>
          <View style={styles.dateValueRow}>
            <Ionicons color={colors.primary} name="calendar-outline" size={18} />
            <Text style={[styles.dateValue, !endDate && styles.placeholder]}>
              {endDate ? formatDatePtBr(endDate) : 'Selecionar'}
            </Text>
          </View>
        </Pressable>
      </View>

      {Platform.OS === 'android' && activePicker ? (
        <DateTimePicker
          display="calendar"
          minimumDate={pickerMinimumDate}
          mode="date"
          onChange={handleAndroidChange}
          value={draftDate}
        />
      ) : null}

      {Platform.OS !== 'android' ? (
        <BottomSheetModal
          onClose={() => setActivePicker(null)}
          subtitle="Escolha a data no calendário."
          title={pickerTitle}
          visible={activePicker !== null}
        >
          <View style={styles.pickerWrap}>
            <DateTimePicker
              display={resolvePickerDisplay()}
              locale="pt-BR"
              minimumDate={pickerMinimumDate}
              mode="date"
              onChange={(_, selectedDate) => {
                if (selectedDate) {
                  setDraftDate(selectedDate);
                }
              }}
              value={draftDate}
            />
          </View>

          <Pressable accessibilityRole="button" onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirmar data</Text>
          </Pressable>
        </BottomSheetModal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: '100%',
    gap: 6,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateInput: {
    flex: 1,
    gap: 6,
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  disabledInput: {
    opacity: 0.6,
  },
  dateLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  dateValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateValue: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  placeholder: {
    color: colors.textMuted,
  },
  pickerWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  confirmButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    marginTop: spacing.sm,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
});
