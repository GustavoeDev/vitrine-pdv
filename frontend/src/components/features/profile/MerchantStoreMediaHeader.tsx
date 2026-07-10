import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ImagePickerSheet } from '@/src/components/ui/ImagePickerSheet';
import { colors, radius } from '@/src/constants/tokens';
import { getEstablishmentInitial } from '@/src/utils/establishmentRegistration';
import { launchCamera, launchGallery } from '@/src/utils/imagePicker';

interface MerchantStoreMediaHeaderProps {
  storeName: string;
  coverImageUri: string | null;
  logoImageUri: string | null;
  isSaving?: boolean;
  onPickCover: (uri: string) => Promise<void>;
  onPickLogo: (uri: string) => Promise<void>;
  children?: React.ReactNode;
}

export function MerchantStoreMediaHeader({
  storeName,
  coverImageUri,
  logoImageUri,
  isSaving = false,
  onPickCover,
  onPickLogo,
  children,
}: MerchantStoreMediaHeaderProps) {
  const initial = getEstablishmentInitial(storeName);
  const [target, setTarget] = useState<'cover' | 'logo' | null>(null);
  const [savingTarget, setSavingTarget] = useState<'cover' | 'logo' | null>(null);
  const isSavingCover = isSaving && savingTarget === 'cover';
  const isSavingLogo = isSaving && savingTarget === 'logo';

  const handleSelect = async (source: 'camera' | 'gallery') => {
    if (!target || isSaving) {
      return;
    }

    const aspect: [number, number] = target === 'cover' ? [16, 9] : [1, 1];
    const uri =
      source === 'camera' && Platform.OS !== 'web'
        ? await launchCamera(aspect)
        : await launchGallery(aspect);

    if (!uri) {
      setTarget(null);
      return;
    }

    const currentTarget = target;
    setSavingTarget(currentTarget);
    setTarget(null);

    try {
      if (currentTarget === 'cover') {
        await onPickCover(uri);
      } else {
        await onPickLogo(uri);
      }
    } finally {
      setSavingTarget(null);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="Alterar foto de capa"
        accessibilityRole="button"
        disabled={isSaving}
        onPress={() => setTarget('cover')}
        style={styles.coverWrap}
      >
        {coverImageUri ? (
          <Image source={{ uri: coverImageUri }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons color={colors.primary} name="image-outline" size={28} />
            <Text style={styles.coverPlaceholderText}>Adicionar capa</Text>
          </View>
        )}
        <View style={styles.editBadge}>
          {isSavingCover ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Ionicons color={colors.primary} name="camera" size={16} />
          )}
        </View>
      </Pressable>

      <View style={styles.identityRow}>
        <Pressable
          accessibilityLabel="Alterar logo da loja"
          accessibilityRole="button"
          disabled={isSaving}
          onPress={() => setTarget('logo')}
          style={styles.logoWrap}
        >
          {logoImageUri ? (
            <Image source={{ uri: logoImageUri }} style={styles.logoImage} />
          ) : (
            <Text style={styles.logoInitial}>{initial}</Text>
          )}
          <View style={styles.logoEditBadge}>
            {isSavingLogo ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Ionicons color={colors.primary} name="camera" size={12} />
            )}
          </View>
        </Pressable>

        {children ? <View style={styles.identityText}>{children}</View> : null}
      </View>

      <ImagePickerSheet
        onClose={() => setTarget(null)}
        onSelect={(source) => void handleSelect(source)}
        subtitle={
          target === 'cover'
            ? 'Escolha uma imagem horizontal para a capa da loja.'
            : 'Escolha a imagem que representa o estabelecimento.'
        }
        title={target === 'cover' ? 'Foto de capa' : 'Logo da loja'}
        visible={target !== null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  coverWrap: {
    width: '100%',
    height: 110,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.neutralSoft,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  coverPlaceholderText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  editBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  identityText: {
    flex: 1,
    gap: 4,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoInitial: {
    color: colors.primary,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
  },
  logoEditBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
