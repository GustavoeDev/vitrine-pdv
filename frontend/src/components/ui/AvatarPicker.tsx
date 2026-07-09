import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/src/constants/tokens';
import { launchCamera, launchGallery } from '@/src/utils/imagePicker';
import { BottomSheetModal } from '@/src/components/ui/BottomSheetModal';

interface AvatarPickerProps {
  imageUri?: string | null;
  initial?: string;
  onImageSelected?: (uri: string) => void;
}

export function AvatarPicker({
  imageUri,
  initial = 'M',
  onImageSelected,
}: AvatarPickerProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleSelect = async (source: 'camera' | 'gallery') => {
    if (!onImageSelected) {
      return;
    }

    const uri =
      source === 'camera' && Platform.OS !== 'web'
        ? await launchCamera([1, 1])
        : await launchGallery([1, 1]);

    if (uri) {
      onImageSelected(uri);
    }

    setIsPickerOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityLabel="Alterar foto de perfil"
        accessibilityRole="button"
        onPress={() => setIsPickerOpen(true)}
      >
        <View style={styles.avatar}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.initial}>{initial}</Text>
          )}
          {!imageUri ? (
            <View style={styles.cameraBadge}>
              <Ionicons color={colors.primary} name="camera" size={14} />
            </View>
          ) : null}
        </View>
      </Pressable>
      <BottomSheetModal
        onClose={() => setIsPickerOpen(false)}
        subtitle="Escolha como deseja adicionar a foto de perfil."
        title="Foto de perfil"
        visible={isPickerOpen}
      >
        {Platform.OS !== 'web' ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void handleSelect('camera')}
            style={styles.option}
          >
            <View style={styles.optionIconWrap}>
              <Ionicons color={colors.primary} name="camera-outline" size={20} />
            </View>
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>Tirar foto</Text>
              <Text style={styles.optionSubtitle}>Abra a câmera para registrar uma imagem.</Text>
            </View>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => void handleSelect('gallery')}
          style={styles.option}
        >
          <View style={styles.optionIconWrap}>
            <Ionicons color={colors.primary} name="images-outline" size={20} />
          </View>
          <View style={styles.optionTextWrap}>
            <Text style={styles.optionTitle}>Escolher da galeria</Text>
            <Text style={styles.optionSubtitle}>Selecione uma imagem já salva no dispositivo.</Text>
          </View>
          <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
        </Pressable>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  initial: {
    color: colors.primary,
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
  },
  cameraBadge: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 28,
    height: 28,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  option: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  optionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  optionTextWrap: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  optionSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
});
