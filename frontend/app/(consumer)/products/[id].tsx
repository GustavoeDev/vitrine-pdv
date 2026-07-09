import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav, resolveBottomNavKey } from '@/src/components/ui/BottomNav';
import { DEFAULT_STORE_AVATAR } from '@/src/constants/images';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useAppModal } from '@/src/contexts/AppModalContext';
import { useProduct, usePublicStore } from '@/src/queries/useDiscovery';
import { recordProductView } from '@/src/services/consumerStores';
import { mapApiProductToProduct } from '@/src/utils/consumerMappers';
import { openWhatsApp } from '@/src/utils/whatsapp';

export default function ProductDetailScreen() {
  const { id, origin } = useLocalSearchParams<{ id: string; origin?: string }>();
  const activeBottomNav = resolveBottomNavKey(origin);
  const { data: apiProduct, isLoading, isError } = useProduct(id);
  const { data: apiStore } = usePublicStore(apiProduct?.store_id);
  const { showAlert } = useAppModal();
  const hasRecordedViewRef = useRef(false);

  useEffect(() => {
    if (!id || hasRecordedViewRef.current || !apiProduct) {
      return;
    }

    hasRecordedViewRef.current = true;
    void recordProductView(id).catch(() => undefined);
  }, [apiProduct, id]);

  const product = apiProduct ? mapApiProductToProduct(apiProduct) : null;
  const storeName = apiProduct?.store_name ?? '';
  const storeId = apiProduct?.store_id ?? '';
  const storeAvatar = apiStore?.logo_url ?? apiStore?.cover_photo_url ?? DEFAULT_STORE_AVATAR;
  const phoneNumber = apiStore?.phone_number ?? '';

  const handleWhatsAppPress = async () => {
    if (!phoneNumber) {
      await showAlert({
        title: 'WhatsApp indisponível',
        subtitle: 'Esta loja ainda não informou um telefone.',
      });
      return;
    }

    const message = product
      ? `Olá! Vi o produto ${product.name} no VitrinePDV e gostaria de mais informações.`
      : 'Olá! Vi sua loja no VitrinePDV e gostaria de mais informações.';

    const opened = await openWhatsApp(phoneNumber, message);

    if (!opened) {
      await showAlert({
        title: 'WhatsApp indisponível',
        subtitle: 'Não foi possível abrir o WhatsApp neste dispositivo.',
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Produto não encontrado</Text>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
          </Pressable>

          <Image source={{ uri: product.imageUrl }} style={styles.productImage} />

          <View style={styles.titleRow}>
            <View style={styles.titleColumn}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.category}>{product.category}</Text>
            </View>
            <Text style={styles.price}>{product.price}</Text>
          </View>

          <Text style={styles.description}>
            {product.description || 'Este produto ainda não possui descrição.'}
          </Text>

          <View style={styles.storeRow}>
            <Image source={{ uri: storeAvatar }} style={styles.storeAvatar} />
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{storeName}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push(
                    `/(consumer)/stores/${storeId}?origin=${activeBottomNav}` as never,
                  )
                }
              >
                <Text style={styles.viewStoreLink}>Ver loja</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => void handleWhatsAppPress()}
            style={styles.whatsAppButton}
          >
            <Ionicons color={colors.white} name="logo-whatsapp" size={22} />
            <Text style={styles.whatsAppText}>Falar no WhatsApp</Text>
          </Pressable>
        </ScrollView>

        <BottomNav active={activeBottomNav} isRootScreen={false} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  backLink: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    color: colors.primary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralSoft,
  },
  productImage: {
    width: '100%',
    height: 240,
    borderRadius: radius.lg - 4,
    backgroundColor: colors.neutralSoft,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleColumn: {
    flex: 1,
    gap: 4,
  },
  productName: {
    color: colors.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  category: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
  },
  price: {
    color: colors.primary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg - 4,
    backgroundColor: colors.surface,
  },
  storeAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
  },
  storeInfo: {
    flex: 1,
    gap: 4,
  },
  storeName: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },
  viewStoreLink: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  whatsAppButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#25D366',
  },
  whatsAppText: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },
});
