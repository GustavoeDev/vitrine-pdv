import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BusinessHoursDayCard } from '@/src/components/features/establishment/BusinessHoursDayCard';
import { BottomSheetModal } from '@/src/components/ui/BottomSheetModal';
import { colors, radius, spacing } from '@/src/constants/tokens';
import type { DaySchedule, EstablishmentRegistrationData } from '@/src/types/establishment';
import type { ApiBusinessHour } from '@/src/types/store';
import { isHoursStepComplete } from '@/src/utils/establishmentRegistration';
import { scheduleFromApiBusinessHours } from '@/src/utils/merchantStoreProfile';

interface EditStoreBusinessHoursModalProps {
  initialHours: ApiBusinessHour[];
  isSaving?: boolean;
  onClose: () => void;
  onSave: (schedule: DaySchedule[]) => Promise<void>;
  visible: boolean;
}

export function EditStoreBusinessHoursModal({
  initialHours,
  isSaving = false,
  onClose,
  onSave,
  visible,
}: EditStoreBusinessHoursModalProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(() =>
    scheduleFromApiBusinessHours(initialHours),
  );

  useEffect(() => {
    if (visible) {
      setSchedule(scheduleFromApiBusinessHours(initialHours));
    }
  }, [initialHours, visible]);

  const handleSave = async () => {
    if (!isHoursStepComplete({ schedule } as EstablishmentRegistrationData)) {
      return;
    }

    await onSave(schedule);
  };

  return (
    <BottomSheetModal
      onClose={onClose}
      scrollProps={{ contentContainerStyle: styles.scrollContent }}
      subtitle="Configure os dias e horários de funcionamento."
      title="Horário de funcionamento"
      visible={visible}
    >
      <View style={styles.content}>
        {schedule.map((daySchedule) => (
          <BusinessHoursDayCard
            key={daySchedule.day}
            onChange={(nextSchedule) => {
              setSchedule((current) =>
                current.map((entry) => (entry.day === nextSchedule.day ? nextSchedule : entry)),
              );
            }}
            schedule={daySchedule}
          />
        ))}

        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={() => void handleSave()}
          style={styles.saveButton}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Salvar horários</Text>
          )}
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  content: {
    gap: spacing.md,
  },
  saveButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
});
