import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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

import { BottomNav, BottomNavKey, resolveBottomNavKey } from '@/src/components/ui/BottomNav';
import { BusinessHoursDisplay } from '@/src/components/features/BusinessHoursDisplay';
import { SeeMoreLink } from '@/src/components/features/store/SeeMoreLink';
import { StoreProfileProductCard } from '@/src/components/features/store/StoreProfileProductCard';
import { StoreProfileReviewCard } from '@/src/components/features/store/StoreProfileReviewCard';
import { StoreReviewFormModal } from '@/src/components/features/store/StoreReviewFormModal';
import { StoreReviewsSummary } from '@/src/components/features/store/StoreReviewsSummary';
import { DEFAULT_STORE_AVATAR, DEFAULT_STORE_COVER } from '@/src/constants/images';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useAppModal } from '@/src/contexts/AppModalContext';
import { usePublicStore, useStoreProducts, discoveryKeys } from '@/src/queries/useDiscovery';
import { useIsStoreFavorited, useFavoriteStore, useToggleFavorite, useToggleFavoriteNotifications, useStoreActivePromotions } from '@/src/queries/usePromotions';
import {
  useIsStoreOwner,
  useMyStoreReview,
  useStoreReviews,
  useSubmitStoreReview,
} from '@/src/queries/useReviews';
import { useAuthStore } from '@/src/stores/authStore';
import type { ApiStoreDetail } from '@/src/services/consumerStores';
import { mapApiStoreReviewToReview } from '@/src/services/reviews';
import {
  STORE_PRODUCTS_PREVIEW_LIMIT,
  STORE_REVIEWS_PREVIEW_LIMIT,
} from '@/src/utils/storeProfile';
import { buildBusinessHoursRowsFromApi } from '@/src/utils/businessHours';
import {
  mapApiProductSummaryToProduct,
  mapApiStoreDetailToStore,
} from '@/src/utils/consumerMappers';
import { openWhatsApp } from '@/src/utils/whatsapp';
import { useQueryClient } from '@tanstack/react-query';
import { normalizeRouteParam } from '@/src/utils/routeParams';
import type { ApiConsumerPromotion } from '@/src/services/promotions';

type StoreTab = 'products' | 'reviews';

function resolveTab(tab?: string | string[]): StoreTab {
  return tab === 'reviews' ? 'reviews' : 'products';
}

function ActionButton({
  icon,
  iconColor,
  label,
  onPress,
  primary = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label?: string;
  onPress?: () => void;
  primary?: boolean;
}) {
  const resolvedIconColor = iconColor ?? (primary ? colors.white : colors.textPrimary);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.actionButton, primary ? styles.whatsAppButton : styles.secondaryAction]}
    >
      <Ionicons color={resolvedIconColor} name={icon} size={22} />
      {label ? <Text style={styles.actionLabel}>{label}</Text> : null}
    </Pressable>
  );
}

function StorePromotionCard({
  origin,
  promotion,
}: {
  origin: BottomNavKey;
  promotion: ApiConsumerPromotion;
}) {
  const imageUrl = promotion.image_url ?? DEFAULT_STORE_COVER;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push(`/(consumer)/promotions/${promotion.id}?origin=${origin}` as never)
      }
      style={styles.storePromotionCard}
    >
      <Image source={{ uri: imageUrl }} style={styles.storePromotionImage} />
      <View style={styles.storePromotionOverlay}>
        <Text style={styles.storePromotionEyebrow}>PROMOÇÃO ATIVA</Text>
        <Text numberOfLines={2} style={styles.storePromotionTitle}>
          {promotion.title}
        </Text>
        <View style={styles.storePromotionLink}>
          <Text style={styles.storePromotionLinkText}>Ver oferta</Text>
          <Ionicons color={colors.white} name="arrow-forward" size={14} />
        </View>
      </View>
    </Pressable>
  );
}

function resolveStoreView(apiStore: ApiStoreDetail | undefined): ReturnType<typeof mapApiStoreDetailToStore> | null {
  if (!apiStore) {
    return null;
  }

  return mapApiStoreDetailToStore(apiStore);
}

export default function StoreProfileScreen() {
  const { id, origin, tab } = useLocalSearchParams<{ id: string; origin?: string; tab?: string }>();
  const storeId = normalizeRouteParam(id);
  const queryClient = useQueryClient();
  const activeTab = resolveTab(tab);
  const activeBottomNav = resolveBottomNavKey(origin);
  const { showAlert } = useAppModal();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const isFavorited = useIsStoreFavorited(storeId);
  const favoriteStore = useFavoriteStore(storeId);
  const toggleFavorite = useToggleFavorite();
  const toggleFavoriteNotifications = useToggleFavoriteNotifications();
  const isStoreOwner = useIsStoreOwner(storeId);
  const submitReview = useSubmitStoreReview(storeId ?? '');
  const { data: apiStore, isLoading: isLoadingStore, isError: isStoreError } = usePublicStore(storeId);
  const {
    data: apiReviews = [],
    isLoading: isLoadingReviews,
    isError: isReviewsError,
  } = useStoreReviews(storeId);
  const { data: myReview } = useMyStoreReview(storeId);
  const {
    data: apiProducts = [],
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useStoreProducts(storeId);
  const { data: activePromotions = [] } = useStoreActivePromotions(storeId);
  const featuredPromotion = activePromotions[0] ?? null;

  useFocusEffect(
    useCallback(() => {
      if (!storeId) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: discoveryKeys.storeProducts(storeId) });
    }, [queryClient, storeId]),
  );
  const store = resolveStoreView(apiStore);
  const products = apiProducts.map(mapApiProductSummaryToProduct);
  const reviews = useMemo(() => apiReviews.map(mapApiStoreReviewToReview), [apiReviews]);
  const previewProducts = useMemo(
    () => products.slice(0, STORE_PRODUCTS_PREVIEW_LIMIT),
    [products],
  );
  const previewReviews = useMemo(
    () => reviews.slice(0, STORE_REVIEWS_PREVIEW_LIMIT),
    [reviews],
  );
  const hasMoreProducts = products.length > STORE_PRODUCTS_PREVIEW_LIMIT;
  const hasMoreReviews = reviews.length > STORE_REVIEWS_PREVIEW_LIMIT;
  const averageRating = store?.rating ?? 0;
  const reviewsCount = store?.reviews ?? 0;
  const addressLine = apiStore
    ? `${apiStore.address.street}, ${apiStore.address.number} • ${apiStore.address.district}`
    : '';
  const coverImageUrl = apiStore?.cover_photo_url ?? DEFAULT_STORE_COVER;
  const avatarUrl = apiStore?.logo_url ?? DEFAULT_STORE_AVATAR;
  const businessHoursRows = buildBusinessHoursRowsFromApi(apiStore?.business_hours ?? []);

  const handleWhatsAppPress = async () => {
    const phoneNumber = apiStore?.phone_number ?? '';

    if (!phoneNumber) {
      await showAlert({
        title: 'WhatsApp indisponível',
        subtitle: 'Esta loja ainda não informou um telefone.',
      });
      return;
    }

    const message = store
      ? `Olá! Vi a loja ${store.name} no VitrinePDV e gostaria de mais informações.`
      : 'Olá! Vi sua loja no VitrinePDV e gostaria de mais informações.';

    const opened = await openWhatsApp(phoneNumber, message);

    if (!opened) {
      await showAlert({
        title: 'WhatsApp indisponível',
        subtitle: 'Não foi possível abrir o WhatsApp neste dispositivo.',
      });
    }
  };

  const handleFavoritePress = async () => {
    if (!storeId) {
      return;
    }

    if (!accessToken) {
      await showAlert({
        title: 'Entre na sua conta',
        subtitle: 'Faça login para favoritar lojas e receber ofertas personalizadas.',
      });
      return;
    }

    try {
      await toggleFavorite.mutateAsync({
        storeId,
        isFavorited,
      });
    } catch {
      await showAlert({
        title: 'Erro',
        subtitle: 'Não foi possível atualizar seus favoritos.',
      });
    }
  };

  const handleReviewPress = async () => {
    if (!accessToken) {
      await showAlert({
        title: 'Entre na sua conta',
        subtitle: 'Faça login para avaliar lojas.',
      });
      return;
    }

    setIsReviewModalVisible(true);
  };

  const handleSubmitReview = async (payload: { rating: number; comment: string }) => {
    if (!storeId) {
      return;
    }

    try {
      await submitReview.mutateAsync({
        ...payload,
        isUpdate: Boolean(myReview),
      });
      setIsReviewModalVisible(false);
    } catch (error: unknown) {
      const detail =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { detail?: string } } }).response?.data?.detail ===
          'string'
          ? (error as { response: { data: { detail: string } } }).response.data.detail
          : 'Não foi possível salvar sua avaliação.';

      await showAlert({
        title: 'Erro',
        subtitle: detail,
      });
    }
  };

  const handleStoreNotificationsPress = async () => {
    if (!storeId || !favoriteStore) {
      return;
    }

    try {
      await toggleFavoriteNotifications.mutateAsync({
        storeId,
        notificationsEnabled: !favoriteStore.notifications_enabled,
      });
    } catch {
      await showAlert({
        title: 'Erro',
        subtitle: 'Não foi possível atualizar as notificações desta loja.',
      });
    }
  };

  if (isLoadingStore) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (isStoreError || !store || !apiStore) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Loja não encontrada</Text>
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

          <View style={styles.hoursSection}>
            <Text style={styles.hoursTitle}>Horário de funcionamento</Text>
            <BusinessHoursDisplay rows={businessHoursRows} />
          </View>

          <View style={styles.actionsRow}>
            <ActionButton
              icon="logo-whatsapp"
              label="WhatsApp"
              onPress={() => void handleWhatsAppPress()}
              primary
            />
            <ActionButton
              icon={isFavorited ? 'heart' : 'heart-outline'}
              iconColor={isFavorited ? colors.primary : undefined}
              onPress={() => void handleFavoritePress()}
            />
            {isFavorited ? (
              <ActionButton
                icon={
                  favoriteStore?.notifications_enabled
                    ? 'notifications'
                    : 'notifications-off-outline'
                }
                iconColor={
                  favoriteStore?.notifications_enabled ? colors.primary : undefined
                }
                onPress={() => void handleStoreNotificationsPress()}
              />
            ) : null}
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
              {featuredPromotion ? (
                <StorePromotionCard origin={activeBottomNav} promotion={featuredPromotion} />
              ) : null}
              {isLoadingProducts ? (
                <ActivityIndicator color={colors.primary} />
              ) : isProductsError ? (
                <Text style={styles.emptyProductsText}>
                  Não foi possível carregar os produtos desta loja.
                </Text>
              ) : products.length === 0 ? (
                <Text style={styles.emptyProductsText}>
                  Esta loja ainda não cadastrou produtos.
                </Text>
              ) : (
                <>
                  <View style={styles.productGrid}>
                    {previewProducts.map((product) => (
                      <StoreProfileProductCard
                        key={product.id}
                        origin={activeBottomNav}
                        product={product}
                      />
                    ))}
                  </View>
                  {hasMoreProducts ? (
                    <SeeMoreLink
                      onPress={() =>
                        router.push(
                          `/(consumer)/stores/${storeId}/products?origin=${activeBottomNav}` as never,
                        )
                      }
                    />
                  ) : null}
                </>
              )}
            </View>
          ) : (
            <View style={styles.reviewsSection}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.reviewsTitle}>Avaliações</Text>
                {!isStoreOwner ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void handleReviewPress()}
                    style={styles.reviewActionButton}
                  >
                    <Text style={styles.reviewActionText}>
                      {myReview ? 'Editar avaliação' : 'Avaliar loja'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
              {isLoadingReviews ? (
                <ActivityIndicator color={colors.primary} />
              ) : isReviewsError ? (
                <Text style={styles.emptyProductsText}>
                  Não foi possível carregar as avaliações desta loja.
                </Text>
              ) : reviewsCount === 0 ? (
                <Text style={styles.emptyProductsText}>
                  Esta loja ainda não recebeu avaliações.
                </Text>
              ) : (
                <>
                  <StoreReviewsSummary
                    averageRating={averageRating}
                    reviews={reviews}
                    reviewsCount={reviewsCount}
                  />
                  <View style={styles.reviewList}>
                    {previewReviews.map((review) => (
                      <StoreProfileReviewCard key={review.id} review={review} />
                    ))}
                  </View>
                  {hasMoreReviews ? (
                    <SeeMoreLink
                      onPress={() =>
                        router.push(
                          `/(consumer)/stores/${storeId}/reviews?origin=${activeBottomNav}` as never,
                        )
                      }
                    />
                  ) : null}
                </>
              )}
            </View>
          )}
        </ScrollView>

        <StoreReviewFormModal
          initialComment={myReview?.comment ?? ''}
          initialRating={myReview?.rating ?? 0}
          isSaving={submitReview.isPending}
          isUpdate={Boolean(myReview)}
          onClose={() => setIsReviewModalVisible(false)}
          onSubmit={handleSubmitReview}
          visible={isReviewModalVisible}
        />

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
  hoursSection: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg - 4,
    backgroundColor: colors.surface,
  },
  hoursTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  productsContent: {
    gap: spacing.md,
  },
  emptyProductsText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: spacing.md,
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
  reviewsSection: {
    gap: spacing.sm,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  reviewsTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  reviewActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
  },
  reviewActionText: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  reviewList: {
    gap: spacing.sm,
  },
});
