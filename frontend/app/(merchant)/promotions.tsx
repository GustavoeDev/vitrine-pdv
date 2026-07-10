import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantPromotionCard } from '@/src/components/merchant/MerchantPromotionCard';
import { MerchantBottomNav } from '@/src/components/merchant/MerchantBottomNav';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useMerchant } from '@/src/contexts/MerchantContext';
import { MerchantPromotionStatus } from '@/src/types/merchant';

const FILTERS: Array<{ key: MerchantPromotionStatus; label: string }> = [
  { key: 'active', label: 'Ativas' },
  { key: 'scheduled', label: 'Agendadas' },
  { key: 'ended', label: 'Encerradas' },
];

export default function MerchantPromotionsScreen() {
  const { promotions, isLoadingPromotions, isSavingPromotion, updatePromotionStatus } = useMerchant();
  const [filter, setFilter] = useState<MerchantPromotionStatus>('active');

  const counts = useMemo(() => {
    return FILTERS.reduce<Record<MerchantPromotionStatus, number>>(
      (accumulator, item) => {
        accumulator[item.key] = promotions.filter((promotion) => promotion.status === item.key).length;
        return accumulator;
      },
      { active: 0, scheduled: 0, ended: 0 },
    );
  }, [promotions]);

  const filteredPromotions = useMemo(
    () => promotions.filter((promotion) => promotion.status === filter),
    [filter, promotions],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Minhas Promoções</Text>
              <Text style={styles.subtitle}>{promotions.length} promoções cadastradas</Text>
            </View>
          </View>

          <View style={styles.tabs}>
            {FILTERS.map((item) => {
              const isActive = filter === item.key;

              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  onPress={() => setFilter(item.key)}
                  style={[styles.tab, isActive && styles.tabActive]}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {item.label}
                  </Text>
                  <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                    <Text style={[styles.countText, isActive && styles.countTextActive]}>
                      {counts[item.key]}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {isLoadingPromotions ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : filteredPromotions.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons color={colors.textMuted} name="pricetag-outline" size={40} />
              <Text style={styles.emptyTitle}>Nenhuma promoção {FILTERS.find((item) => item.key === filter)?.label.toLowerCase()}</Text>
              <Text style={styles.emptySubtitle}>
                Crie uma nova promoção para destacar sua loja na home dos clientes.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {filteredPromotions.map((promotion) => (
                <MerchantPromotionCard
                  key={promotion.id}
                  isSaving={isSavingPromotion}
                  onEdit={() => router.push(`/(merchant)/promotions/${promotion.id}` as never)}
                  onToggleStatus={() =>
                    void updatePromotionStatus(
                      promotion,
                      promotion.status === 'active' ? 'ended' : 'active',
                    )
                  }
                  promotion={promotion}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(merchant)/promotions/new')}
          style={styles.fab}
        >
          <Ionicons color={colors.white} name="add" size={28} />
        </Pressable>

        <MerchantBottomNav active="promotions" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: 10 },
  scrollContent: { paddingTop: 24, paddingBottom: 96, gap: spacing.md },
  header: { paddingVertical: 4 },
  title: { color: colors.textPrimary, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 19, fontWeight: '400' },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.neutralSoft,
  },
  tabActive: {
    backgroundColor: colors.primarySoft,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderRadius: radius.full,
    backgroundColor: colors.background,
  },
  countBadgeActive: {
    backgroundColor: colors.primary,
  },
  countText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  countTextActive: {
    color: colors.white,
  },
  loadingWrap: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  list: { gap: spacing.md },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
