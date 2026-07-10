import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthTextInput } from '@/src/components/ui/AuthTextInput';
import { BottomSheetModal } from '@/src/components/ui/BottomSheetModal';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { changePassword, type ChangePasswordInput } from '@/src/services/auth';

interface ChangePasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
  visible: boolean;
}

export function ChangePasswordModal({ onClose, onSuccess, visible }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
  }, [visible]);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação da nova senha não confere.');
      return;
    }

    if (newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    const payload: ChangePasswordInput = {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirm: confirmPassword,
    };

    setIsSaving(true);
    setError(null);

    try {
      await changePassword(payload);
      onSuccess();
      onClose();
    } catch {
      setError('Não foi possível alterar a senha. Verifique a senha atual.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheetModal
      onClose={onClose}
      subtitle="Informe a senha atual e defina uma nova senha."
      title="Alterar senha"
      visible={visible}
    >
      <View style={styles.content}>
        <AuthTextInput
          autoComplete="password"
          label="Senha atual"
          onChangeText={setCurrentPassword}
          secureTextEntry
          value={currentPassword}
        />
        <AuthTextInput
          autoComplete="new-password"
          label="Nova senha"
          onChangeText={setNewPassword}
          secureTextEntry
          value={newPassword}
        />
        <AuthTextInput
          autoComplete="new-password"
          label="Confirmar nova senha"
          onChangeText={setConfirmPassword}
          secureTextEntry
          value={confirmPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={() => void handleSave()}
          style={styles.saveButton}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Salvar nova senha</Text>
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
  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
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
