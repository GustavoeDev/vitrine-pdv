import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheetModal } from '@/src/components/ui/BottomSheetModal';
import { colors, radius } from '@/src/constants/tokens';
import { getEstablishmentInitial } from '@/src/utils/establishmentRegistration';
import { launchCamera, launchGallery } from '@/src/utils/imagePicker';

interface MediaPickersProps {
  name: string;
  coverImageUri: string | null;
  logoImageUri: string | null;
  onPickCover: (uri: string) => void;
  onPickLogo: (uri: string) => void;
}

export function EstablishmentMediaPickers({
  name,
  coverImageUri,
  logoImageUri,
  onPickCover,
  onPickLogo,
}: MediaPickersProps) {
  const initial = getEstablishmentInitial(name);
  const [target, setTarget] = useState<'cover' | 'logo' | null>(null);

  const handleSelect = async (source: 'camera' | 'gallery') => {
    if (!target) {
      return;
    }

    const aspect: [number, number] = target === 'cover' ? [16, 9] : [1, 1];
    const uri =
      source === 'camera' && Platform.OS !== 'web'
        ? await launchCamera(aspect)
        : await launchGallery(aspect);

    if (uri) {
      if (target === 'cover') {
        onPickCover(uri);
      } else {
        onPickLogo(uri);
      }
    }

    setTarget(null);
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="Adicionar foto de capa"
        accessibilityRole="button"
        onPress={() => setTarget('cover')}
        style={styles.coverWrap}
      >
        {coverImageUri ? (
          <Image source={{ uri: coverImageUri }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <View style={styles.cameraCircle}>
              <Ionicons color={colors.primary} name="camera" size={30} />
            </View>
            <Text style={styles.coverText}>Toque para adicionar foto de capa</Text>
          </View>
        )}
      </Pressable>

      <Pressable
        accessibilityLabel="Adicionar logo"
        accessibilityRole="button"
        onPress={() => setTarget('logo')}
        style={styles.logoWrap}
      >
        {logoImageUri ? (
          <Image source={{ uri: logoImageUri }} style={styles.logoImage} />
        ) : (
          <Text style={styles.logoInitial}>{initial}</Text>
        )}
        {!logoImageUri ? (
          <View style={styles.logoBadge} pointerEvents="none">
            <Ionicons color={colors.primary} name="camera" size={14} />
          </View>
        ) : null}
      </Pressable>

      <BottomSheetModal
        onClose={() => setTarget(null)}
        subtitle={
          target === 'cover'
            ? 'Adicione uma imagem horizontal para destacar o seu negócio.'
            : 'Escolha a imagem que representa o estabelecimento.'
        }
        title={target === 'cover' ? 'Foto de capa' : 'Foto de perfil'}
        visible={target !== null}
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
              <Text style={styles.optionSubtitle}>Abra a câmera e capture uma nova imagem.</Text>
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
            <Text style={styles.optionSubtitle}>Selecione uma foto já salva no dispositivo.</Text>
          </View>
          <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
        </Pressable>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 56,
  },
  coverWrap: {
    width: '100%',
    height: 140,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cameraCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  coverText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
  },
  logoWrap: {
    position: 'absolute',
    bottom: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  logoInitial: {
    color: colors.primary,
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
  },
  logoBadge: {
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
