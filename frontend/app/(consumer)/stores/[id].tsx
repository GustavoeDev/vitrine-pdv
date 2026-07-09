import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav, BottomNavKey, resolveBottomNavKey } from '@/src/components/ui/BottomNav';
import { DEFAULT_PRODUCT_IMAGE, DEFAULT_STORE_AVATAR, DEFAULT_STORE_COVER } from '@/src/constants/images';
import { colors, radius, spacing } from '@/src/constants/tokens';
import {
  consumerStore,
  promotionOfTheDay,
  storeProducts,
  storeReviews,
} from '@/src/mocks/consumer';
import { usePublicStore, useStoreProducts } from '@/src/queries/useDiscovery';
import type { ApiProductSummary, ApiPublicStore } from '@/src/services/consumerStores';
import { Product, Review, Store } from '@/src/types';
import {
  formatProductPrice,
  mapApiPublicStoreToStore,
} from '@/src/utils/consumerMappers';

type StoreTab = 'products' | 'reviews';

function resolveTab(tab?: string | string[]): StoreTab {
  return tab === 'reviews' ? 'reviews' : 'products';
}

function ActionButton({
  icon,
  label,
  primary = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.actionButton, primary ? styles.whatsAppButton : styles.secondaryAction]}
    >
      <Ionicons color={primary ? colors.white : colors.textPrimary} name={icon} size={22} />
      {label ? <Text style={styles.actionLabel}>{label}</Text> : null}
    </Pressable>
  );
}

function StoreProductCard({ origin, product }: { origin: BottomNavKey; product: Product }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/(consumer)/products/${product.id}?origin=${origin}` as never)}
      style={styles.productCard}
    >
      <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      <Text numberOfLines={1} style={styles.productName}>
        {product.name}
      </Text>
      <Text style={styles.productPrice}>{product.price}</Text>
    </Pressable>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.reviewCard}>
      <Text style={styles.reviewAuthor}>{review.authorName}</Text>
      <Text style={styles.reviewStars}>{'★'.repeat(review.rating)}</Text>
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );
}

function StorePromotionCard({ origin }: { origin: BottomNavKey }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push(`/(consumer)/promotions/${promotionOfTheDay.id}?origin=${origin}` as never)
      }
      style={styles.storePromotionCard}
    >
      <Image source={{ uri: promotionOfTheDay.imageUrl }} style={styles.storePromotionImage} />
      <View style={styles.storePromotionOverlay}>
        <Text style={styles.storePromotionEyebrow}>PROMOÇÃO DO DIA</Text>
        <Text numberOfLines={2} style={styles.storePromotionTitle}>
          {promotionOfTheDay.title}
        </Text>
        <View style={styles.storePromotionLink}>
          <Text style={styles.storePromotionLinkText}>Ver oferta</Text>
          <Ionicons color={colors.white} name="arrow-forward" size={14} />
        </View>
      </View>
    </Pressable>
  );
}

function mapApiProductSummaryToProduct(apiProduct: ApiProductSummary): Product {
  return {
    id: apiProduct.id,
    storeId: apiProduct.store_id,
    name: apiProduct.name,
    category: '',
    description: '',
    price: formatProductPrice(apiProduct.price),
    imageUrl: apiProduct.photo_url ?? DEFAULT_PRODUCT_IMAGE,
  };
}

function resolveStoreView(
  apiStore: ReturnType<typeof usePublicStore>['data'],
  fallbackStore: Store,
): Store {
  if (!apiStore) {
    return fallbackStore;
  }

  return mapApiPublicStoreToStore({
    id: apiStore.id,
    name: apiStore.name,
    status: apiStore.status,
    category_id: apiStore.category_id,
    category_name: apiStore.category_name,
    subcategory: apiStore.subcategory,
    logo_url: apiStore.logo_url,
    cover_photo_url: apiStore.cover_photo_url,
    address_summary: `${apiStore.address.city}, ${apiStore.address.state}`,
  } satisfies ApiPublicStore);
}

export default function StoreProfileScreen() {
  const { id, origin, tab } = useLocalSearchParams<{ id: string; origin?: string; tab?: string }>();
  const activeTab = resolveTab(tab);
  const activeBottomNav = resolveBottomNavKey(origin);
  const { data: apiStore } = usePublicStore(id);
  const { data: apiProducts = [] } = useStoreProducts(id);
  const store = resolveStoreView(apiStore, consumerStore);
  const products =
    apiProducts.length > 0
      ? apiProducts.map(mapApiProductSummaryToProduct)
      : storeProducts;
  const addressLine = apiStore
    ? `${apiStore.address.street}, ${apiStore.address.number} • ${apiStore.address.district}`
    : 'Rua da Matriz, 123 • Centro';
  const coverImageUrl = apiStore?.cover_photo_url ?? store.coverImageUrl ?? DEFAULT_STORE_COVER;
  const avatarUrl = apiStore?.logo_url ?? store.avatarUrl ?? DEFAULT_STORE_AVATAR;

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

          <View style={styles.coverWrap}>
            <Image source={{ uri: coverImageUrl }} style={styles.coverImage} />
            <Image source={{ uri: avatarUrl }} style={styles.storeAvatar} />
          </View>

          <View style={styles.storeInfo}>
            <Text style={styles.storeTitle}>{store.name}</Text>
            <Text style={styles.storeSubtitle}>
              {store.category} • {store.subcategory}
            </Text>
            <Text style={styles.storeAddress}>{addressLine}</Text>
          </View>

          <View style={styles.actionsRow}>
            <ActionButton icon="logo-whatsapp" label="WhatsApp" primary />
            <ActionButton icon="heart-outline" />
          </View>

          <View style={styles.tabs}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.setParams({ tab: undefined })}
              style={[styles.tab, activeTab === 'products' ? styles.activeTab : styles.inactiveTab]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'products' ? styles.activeTabText : styles.inactiveTabText,
                ]}
              >
                Produtos
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.setParams({ tab: 'reviews' })}
              style={[styles.tab, activeTab === 'reviews' ? styles.activeTab : styles.inactiveTab]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'reviews' ? styles.activeTabText : styles.inactiveTabText,
                ]}
              >
                Avaliações
              </Text>
            </Pressable>
          </View>

          {activeTab === 'products' ? (
            <View style={styles.productsContent}>
              <StorePromotionCard origin={activeBottomNav} />
              <View style={styles.productGrid}>
                {products.map((product) => (
                  <StoreProductCard
                    key={product.id}
                    origin={activeBottomNav}
                    product={product}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.reviewsSection}>
              <Text style={styles.reviewsTitle}>Avaliações</Text>
              <View style={styles.averageRow}>
                <Text style={styles.averageScore}>4,8</Text>
                <Text style={styles.averageStars}>★★★★★</Text>
                <Text style={styles.averageCount}>124 avaliações</Text>
              </View>
              {storeReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </View>
          )}
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
    gap: spacing.lg,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.neutralSoft,
  },
  coverWrap: {
    width: '100%',
    height: 212,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 212,
    borderRadius: radius.lg - 4,
    backgroundColor: colors.neutralSoft,
  },
  storeAvatar: {
    position: 'absolute',
    left: 16,
    bottom: -31,
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: colors.background,
    backgroundColor: colors.neutralSoft,
  },
  storeInfo: {
    gap: 6,
    marginTop: 26,
  },
  storeTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  storeSubtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  storeAddress: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  whatsAppButton: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: '#25D366',
  },
  secondaryAction: {
    width: 52,
    backgroundColor: colors.neutralSoft,
  },
  actionLabel: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  activeTab: {
    backgroundColor: colors.primarySoft,
  },
  inactiveTab: {
    backgroundColor: colors.neutralSoft,
  },
  tabText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  activeTabText: {
    color: colors.primary,
  },
  inactiveTabText: {
    color: colors.textSecondary,
  },
  productGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  productsContent: {
    gap: spacing.md,
  },
  storePromotionCard: {
    width: '100%',
    height: 118,
    overflow: 'hidden',
    borderRadius: radius.lg - 4,
    backgroundColor: colors.primary,
  },
  storePromotionImage: {
    width: '100%',
    height: '100%',
    opacity: 0.72,
    backgroundColor: colors.neutralSoft,
  },
  storePromotionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    gap: 4,
    padding: spacing.lg,
    backgroundColor: 'rgba(249, 115, 22, 0.28)',
  },
  storePromotionEyebrow: {
    color: colors.white,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  storePromotionTitle: {
    color: colors.white,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  storePromotionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storePromotionLinkText: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  productCard: {
    flex: 1,
    gap: 4,
    padding: 6,
    borderRadius: radius.lg - 4,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
  },
  productName: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  productPrice: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  reviewsSection: {
    gap: 4,
  },
  reviewsTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  averageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  averageScore: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  averageStars: {
    color: colors.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  averageCount: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  reviewCard: {
    width: '100%',
    paddingVertical: spacing.xs,
    borderRadius: radius.md - 2,
    backgroundColor: colors.surface,
  },
  reviewAuthor: {
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  reviewStars: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  reviewComment: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
});
