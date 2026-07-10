import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthTextInput } from '@/src/components/ui/AuthTextInput';
import { BottomSheetModal } from '@/src/components/ui/BottomSheetModal';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { formatPhone } from '@/src/utils/establishmentRegistration';

interface EditStorePhoneModalProps {
  initialPhone: string;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (phone: string) => Promise<void>;
  visible: boolean;
}

export function EditStorePhoneModal({
  initialPhone,
  isSaving = false,
  onClose,
  onSave,
  visible,
}: EditStorePhoneModalProps) {
  const [phone, setPhone] = useState(initialPhone);

  useEffect(() => {
    if (visible) {
      setPhone(initialPhone);
    }
  }, [initialPhone, visible]);

  const handleSave = async () => {
    const digits = phone.replace(/\D/g, '');

    if (digits.length < 10) {
      return;
    }

    await onSave(digits);
  };

  return (
    <BottomSheetModal
      onClose={onClose}
      subtitle="Esse número será usado no botão de WhatsApp da loja."
      title="WhatsApp da loja"
      visible={visible}
    >
      <View style={styles.content}>
        <AuthTextInput
          keyboardType="phone-pad"
          label="Telefone"
          onChangeText={(value) => setPhone(formatPhone(value))}
          placeholder="(00) 00000-0000"
          value={phone}
        />

        <Pressable
          accessibilityRole="button"
          disabled={isSaving || phone.replace(/\D/g, '').length < 10}
          onPress={() => void handleSave()}
          style={styles.saveButton}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Salvar telefone</Text>
          )}
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
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
