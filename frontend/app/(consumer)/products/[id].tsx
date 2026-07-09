import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav, resolveBottomNavKey } from '@/src/components/ui/BottomNav';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { DEFAULT_STORE_AVATAR } from '@/src/constants/images';
import { consumerStore, storeProducts } from '@/src/mocks/consumer';
import { useProduct, usePublicStore } from '@/src/queries/useDiscovery';
import { mapApiProductToProduct } from '@/src/utils/consumerMappers';

export default function ProductDetailScreen() {
  const { id, origin } = useLocalSearchParams<{ id: string; origin?: string }>();
  const activeBottomNav = resolveBottomNavKey(origin);
  const { data: apiProduct, isLoading } = useProduct(id);
  const { data: apiStore } = usePublicStore(apiProduct?.store_id);

  const fallbackProduct = storeProducts.find((item) => item.id === id) ?? storeProducts[0];
  const product = apiProduct ? mapApiProductToProduct(apiProduct) : fallbackProduct;
  const storeName = apiProduct?.store_name ?? consumerStore.name;
  const storeId = apiProduct?.store_id ?? consumerStore.id;
  const storeAvatar = apiStore?.logo_url ?? apiStore?.cover_photo_url ?? DEFAULT_STORE_AVATAR;

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

          {isLoading ? <ActivityIndicator color={colors.primary} /> : null}

          <Image source={{ uri: product.imageUrl }} style={styles.productImage} />

          <View style={styles.titleRow}>
            <View style={styles.titleColumn}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.category}>{product.category}</Text>
            </View>
            <Text style={styles.price}>{product.price}</Text>
          </View>

          <Text style={styles.description}>{product.description}</Text>

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

          <Pressable accessibilityRole="button" style={styles.whatsAppButton}>
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
