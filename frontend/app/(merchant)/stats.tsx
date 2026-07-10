import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StoreProfileReviewCard } from '@/src/components/features/store/StoreProfileReviewCard';
import { MerchantBottomNav } from '@/src/components/merchant/MerchantBottomNav';
import { CategoryChip } from '@/src/components/features/CategoryChip';
import { colors, spacing } from '@/src/constants/tokens';
import { useMerchant, useMerchantStats } from '@/src/contexts/MerchantContext';
import { useStoreReviews } from '@/src/queries/useReviews';
import { mapApiStoreReviewToReview } from '@/src/services/reviews';
import { MerchantStatsRange } from '@/src/types/merchant';

const PREVIEW_REVIEWS_LIMIT = 3;

export default function MerchantStatsScreen() {
  const { activeStoreId, statsRange, setStatsRange } = useMerchant();
  const stats = useMerchantStats();
  const { data: apiReviews = [], isLoading: isLoadingReviews } = useStoreReviews(activeStoreId);

  const previewReviews = useMemo(
    () => apiReviews.slice(0, PREVIEW_REVIEWS_LIMIT).map(mapApiStoreReviewToReview),
    [apiReviews],
  );

  const ranges: { id: MerchantStatsRange; label: string }[] = [
    { id: '7d', label: '7 dias' },
    { id: '30d', label: '30 dias' },
    { id: '3m', label: '3 meses' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
              <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
            </Pressable>
            <Text style={styles.title}>Estatisticas</Text>
          </View>

          <View style={styles.filters}>
            {ranges.map((range) => (
              <CategoryChip
                compact
                key={range.id}
                label={range.label}
                onPress={() => setStatsRange(range.id)}
                selected={statsRange === range.id}
              />
            ))}
          </View>

          {stats.isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : (
            <>
              <View style={styles.grid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Visualizacoes</Text>
                  <Text style={styles.metricValue}>{stats.views}</Text>
                  <Text style={styles.metricSubtle}>{stats.viewsDelta}</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Favoritos</Text>
                  <Text style={styles.metricValue}>{stats.favorites}</Text>
                  <Text style={styles.metricSubtle}>{stats.favoritesDelta}</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Produtos ativos</Text>
                  <Text style={styles.metricValue}>{stats.activeProducts}</Text>
                  <Text style={styles.metricNeutral}>{stats.totalProducts} cadastrados</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/(merchant)/reviews')}
                  style={styles.metricCard}
                >
                  <Text style={styles.metricTitle}>Avaliacao media</Text>
                  <Text style={styles.metricDark}>{stats.averageRating.toFixed(1)}</Text>
                  <Text style={styles.metricNeutral}>{stats.ratingsCount} avaliacoes</Text>
                </Pressable>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Ultimas avaliacoes</Text>
                  {stats.ratingsCount > 0 ? (
                    <Pressable accessibilityRole="button" onPress={() => router.push('/(merchant)/reviews')}>
                      <Text style={styles.sectionLink}>Ver todas</Text>
                    </Pressable>
                  ) : null}
                </View>
                {isLoadingReviews ? (
                  <ActivityIndicator color={colors.primary} />
                ) : previewReviews.length === 0 ? (
                  <Text style={styles.emptyText}>Sua loja ainda nao recebeu avaliacoes.</Text>
                ) : (
                  <View style={styles.reviewList}>
                    {previewReviews.map((review) => (
                      <StoreProfileReviewCard key={review.id} review={review} />
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Produtos mais vistos</Text>
                {stats.topProducts.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhuma visualizacao no periodo selecionado.</Text>
                ) : (
                  stats.topProducts.map((product) => (
                    <View key={product.id} style={styles.productRow}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productViews}>{product.viewCount} visualizacoes</Text>
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>

        <MerchantBottomNav active="dashboard" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: 10 },
  scrollContent: { paddingTop: 24, paddingBottom: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralSoft,
  },
  title: { color: colors.textPrimary, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  filters: { flexDirection: 'row', gap: spacing.sm },
  centered: { paddingVertical: spacing.xl, alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: {
    width: '48.5%',
    gap: 6,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  metricTitle: { color: colors.textPrimary, fontSize: 12, lineHeight: 16, fontWeight: '700' },
  metricValue: { color: colors.primary, fontSize: 26, lineHeight: 32, fontWeight: '700' },
  metricDark: { color: colors.textPrimary, fontSize: 26, lineHeight: 32, fontWeight: '700' },
  metricSubtle: { color: '#16A34A', fontSize: 12, lineHeight: 16, fontWeight: '400' },
  metricNeutral: { color: colors.textSecondary, fontSize: 12, lineHeight: 16, fontWeight: '400' },
  section: { gap: spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  sectionLink: { color: colors.primary, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  reviewList: { gap: spacing.sm },
  productRow: { gap: 2, paddingVertical: 8 },
  productName: { color: colors.textPrimary, fontSize: 14, lineHeight: 19, fontWeight: '700' },
  productViews: { color: colors.textSecondary, fontSize: 12, lineHeight: 16, fontWeight: '400' },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
});
