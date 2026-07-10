import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StoreProfileReviewCard } from '@/src/components/features/store/StoreProfileReviewCard';
import { StoreReviewFormModal } from '@/src/components/features/store/StoreReviewFormModal';
import { StoreReviewsSummary } from '@/src/components/features/store/StoreReviewsSummary';
import { BottomNav, resolveBottomNavKey } from '@/src/components/ui/BottomNav';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useAppModal } from '@/src/contexts/AppModalContext';
import { usePublicStore } from '@/src/queries/useDiscovery';
import {
  useIsStoreOwner,
  useMyStoreReview,
  useStoreReviews,
  useSubmitStoreReview,
} from '@/src/queries/useReviews';
import { mapApiStoreReviewToReview } from '@/src/services/reviews';
import { useAuthStore } from '@/src/stores/authStore';
import { mapApiStoreDetailToStore } from '@/src/utils/consumerMappers';
import { normalizeRouteParam } from '@/src/utils/routeParams';

export default function StoreReviewsScreen() {
  const { id, origin } = useLocalSearchParams<{ id: string; origin?: string }>();
  const storeId = normalizeRouteParam(id);
  const activeBottomNav = resolveBottomNavKey(origin);
  const { showAlert } = useAppModal();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const isStoreOwner = useIsStoreOwner(storeId);
  const submitReview = useSubmitStoreReview(storeId ?? '');
  const { data: apiStore, isLoading: isLoadingStore } = usePublicStore(storeId);
  const {
    data: apiReviews = [],
    isLoading: isLoadingReviews,
    isError: isReviewsError,
  } = useStoreReviews(storeId);
  const { data: myReview } = useMyStoreReview(storeId);

  const store = apiStore ? mapApiStoreDetailToStore(apiStore) : null;
  const reviews = useMemo(() => apiReviews.map(mapApiStoreReviewToReview), [apiReviews]);
  const storeName = store?.name ?? 'Loja';

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Voltar"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
            </Pressable>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>Avaliações</Text>
              <Text style={styles.subtitle}>{storeName}</Text>
            </View>
            {!isStoreOwner ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => void handleReviewPress()}
                style={styles.reviewActionButton}
              >
                <Text style={styles.reviewActionText}>
                  {myReview ? 'Editar' : 'Avaliar'}
                </Text>
              </Pressable>
            ) : null}
          </View>

          {isLoadingStore || isLoadingReviews ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : isReviewsError ? (
            <Text style={styles.emptyText}>Não foi possível carregar as avaliações desta loja.</Text>
          ) : (store?.reviews ?? 0) === 0 ? (
            <Text style={styles.emptyText}>Esta loja ainda não recebeu avaliações.</Text>
          ) : (
            <View style={styles.content}>
              <StoreReviewsSummary
                averageRating={store?.rating ?? 0}
                reviews={reviews}
                reviewsCount={store?.reviews ?? 0}
              />
              <View style={styles.reviewList}>
                {reviews.map((review) => (
                  <StoreProfileReviewCard key={review.id} review={review} />
                ))}
              </View>
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
  scrollContent: {
    paddingTop: 24,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.neutralSoft,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
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
  centered: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  content: {
    gap: spacing.sm,
  },
  reviewList: {
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
