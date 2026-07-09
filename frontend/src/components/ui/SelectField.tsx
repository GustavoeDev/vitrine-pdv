import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheetModal } from '@/src/components/ui/BottomSheetModal';
import { colors, radius, spacing, typography } from '@/src/constants/tokens';

interface SelectOption {
  id: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  placeholder: string;
  value: string;
  options: SelectOption[];
  onSelect: (optionId: string, optionLabel: string) => void;
  disabled?: boolean;
}

export function SelectField({
  label,
  placeholder,
  value,
  options,
  onSelect,
  disabled = false,
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((option) => option.id === value)?.label;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => setIsOpen(true)}
        style={[styles.inputWrap, disabled && styles.disabledInput]}
      >
        <Text style={[styles.value, !selectedLabel && styles.placeholder]}>
          {selectedLabel ?? placeholder}
        </Text>
        <Ionicons color={colors.textSecondary} name="chevron-down" size={20} />
      </Pressable>

      <BottomSheetModal
        onClose={() => setIsOpen(false)}
        subtitle="Escolha uma opção para continuar."
        title={label}
        visible={isOpen}
      >
        {options.map((option) => (
          <Pressable
            accessibilityRole="button"
            key={option.id}
            onPress={() => {
              onSelect(option.id, option.label);
              setIsOpen(false);
            }}
            style={[styles.option, value === option.id && styles.selectedOption]}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIndicator, value === option.id && styles.selectedIndicator]}>
                {value === option.id ? (
                  <Ionicons color={colors.white} name="checkmark" size={14} />
                ) : null}
              </View>
              <Text style={styles.optionLabel}>{option.label}</Text>
            </View>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={16} />
          </Pressable>
        ))}
      </BottomSheetModal>
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
  inputWrap: {
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  disabledInput: {
    opacity: 0.6,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  placeholder: {
    color: colors.textMuted,
  },
  option: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  selectedOption: {
    backgroundColor: colors.primarySoft,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicator: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
