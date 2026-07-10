import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AvatarPicker } from '@/src/components/ui/AvatarPicker';
import { BottomSheetModal } from '@/src/components/ui/BottomSheetModal';
import { colors, radius, spacing, typography } from '@/src/constants/tokens';
import { uploadMedia } from '@/src/services/media';
import { getEstablishmentInitial } from '@/src/utils/establishmentRegistration';

interface EditPersonalInfoModalProps {
  initialName: string;
  initialAvatarUrl?: string | null;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (payload: { name: string; avatar_url?: string | null }) => Promise<void>;
  visible: boolean;
}

export function EditPersonalInfoModal({
  initialName,
  initialAvatarUrl,
  isSaving = false,
  onClose,
  onSave,
  visible,
}: EditPersonalInfoModalProps) {
  const [name, setName] = useState(initialName);
  const [avatarUri, setAvatarUri] = useState<string | null>(initialAvatarUrl ?? null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(initialName);
    setAvatarUri(initialAvatarUrl ?? null);
  }, [initialAvatarUrl, initialName, visible]);

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    let avatar_url: string | null | undefined;

    if (avatarUri && !avatarUri.startsWith('http')) {
      avatar_url = await uploadMedia(avatarUri, 'avatars');
    } else if (avatarUri !== initialAvatarUrl) {
      avatar_url = avatarUri;
    }

    await onSave({
      name: trimmedName,
      ...(avatar_url !== undefined ? { avatar_url } : {}),
    });
  };

  return (
    <BottomSheetModal
      onClose={onClose}
      subtitle="Atualize seu nome e foto de perfil."
      title="Informações pessoais"
      visible={visible}
    >
      <View style={styles.content}>
        <View style={styles.avatarWrap}>
          <AvatarPicker
            imageUri={avatarUri}
            initial={getEstablishmentInitial(name)}
            onImageSelected={setAvatarUri}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            onChangeText={setName}
            placeholder="Seu nome"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={name}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isSaving || !name.trim()}
          onPress={() => void handleSave()}
          style={[styles.saveButton, (isSaving || !name.trim()) && styles.saveButtonDisabled]}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Salvar alterações</Text>
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
  avatarWrap: {
    alignItems: 'center',
  },
  field: {
    gap: 6,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
  saveButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
});
