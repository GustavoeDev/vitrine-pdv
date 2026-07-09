import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StoreProfileReviewCard } from '@/src/components/features/store/StoreProfileReviewCard';
import { StoreReviewsSummary } from '@/src/components/features/store/StoreReviewsSummary';
import { BottomNav, resolveBottomNavKey } from '@/src/components/ui/BottomNav';
import { colors, spacing } from '@/src/constants/tokens';
import { storeReviews } from '@/src/mocks/consumer';
import { usePublicStore } from '@/src/queries/useDiscovery';
import { normalizeRouteParam } from '@/src/utils/routeParams';

export default function StoreReviewsScreen() {
  const { id, origin } = useLocalSearchParams<{ id: string; origin?: string }>();
  const storeId = normalizeRouteParam(id);
  const activeBottomNav = resolveBottomNavKey(origin);
  const { data: apiStore, isLoading: isLoadingStore } = usePublicStore(storeId);

  const storeName = apiStore?.name ?? 'Loja';

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
          </View>

          {isLoadingStore ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : storeReviews.length === 0 ? (
            <Text style={styles.emptyText}>Esta loja ainda não recebeu avaliações.</Text>
          ) : (
            <View style={styles.content}>
              <StoreReviewsSummary reviews={storeReviews} />
              <View style={styles.reviewList}>
                {storeReviews.map((review) => (
                  <StoreProfileReviewCard key={review.id} review={review} />
                ))}
              </View>
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
