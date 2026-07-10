import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ImagePickerSheet } from '@/src/components/ui/ImagePickerSheet';
import { colors, radius } from '@/src/constants/tokens';
import { launchCamera, launchGallery } from '@/src/utils/imagePicker';

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

      <ImagePickerSheet
        onClose={() => setIsPickerOpen(false)}
        onSelect={(source) => void handleSelect(source)}
        subtitle="Escolha como deseja adicionar a foto de perfil."
        title="Foto de perfil"
        visible={isPickerOpen}
      />
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
});
