import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StoreProfileReviewCard } from '@/src/components/features/store/StoreProfileReviewCard';
import { StoreReviewsSummary } from '@/src/components/features/store/StoreReviewsSummary';
import { MerchantBottomNav } from '@/src/components/merchant/MerchantBottomNav';
import { colors, spacing } from '@/src/constants/tokens';
import { useMerchant, useMerchantStats } from '@/src/contexts/MerchantContext';
import { useStoreReviews } from '@/src/queries/useReviews';
import { mapApiStoreReviewToReview } from '@/src/services/reviews';

export default function MerchantReviewsScreen() {
  const { activeStoreId, activeStoreName } = useMerchant();
  const stats = useMerchantStats();
  const {
    data: apiReviews = [],
    isLoading: isLoadingReviews,
    isError: isReviewsError,
  } = useStoreReviews(activeStoreId);

  const reviews = useMemo(() => apiReviews.map(mapApiStoreReviewToReview), [apiReviews]);
  const storeName = activeStoreName ?? 'Sua loja';

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
              <Text style={styles.title}>Avaliacoes</Text>
              <Text style={styles.subtitle}>{storeName}</Text>
            </View>
          </View>

          {isLoadingReviews ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : isReviewsError ? (
            <Text style={styles.emptyText}>Nao foi possivel carregar as avaliacoes.</Text>
          ) : stats.ratingsCount === 0 ? (
            <Text style={styles.emptyText}>Sua loja ainda nao recebeu avaliacoes.</Text>
          ) : (
            <View style={styles.content}>
              <StoreReviewsSummary
                averageRating={stats.averageRating}
                reviews={reviews}
                reviewsCount={stats.ratingsCount}
              />
              <View style={styles.reviewList}>
                {reviews.map((review) => (
                  <StoreProfileReviewCard key={review.id} review={review} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <MerchantBottomNav active="dashboard" />
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
