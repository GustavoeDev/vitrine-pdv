import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantBottomNav } from '@/src/components/merchant/MerchantBottomNav';
import { colors, spacing } from '@/src/constants/tokens';
import { useMerchant } from '@/src/contexts/MerchantContext';
import { MerchantPromotionStatus } from '@/src/types/merchant';

export default function MerchantPromotionsScreen() {
  const { promotions, updatePromotionStatus } = useMerchant();
  const [filter, setFilter] = useState<MerchantPromotionStatus>('active');

  const filteredPromotions = useMemo(
    () => promotions.filter((promotion) => promotion.status === filter),
    [filter, promotions],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Minhas Promocoes</Text>
          </View>

          <View style={styles.tabs}>
            {[
              ['active', 'Ativas'],
              ['scheduled', 'Agendadas'],
              ['ended', 'Encerradas'],
            ].map(([key, label]) => {
              const isActive = filter === key;
              return (
                <Pressable key={key} onPress={() => setFilter(key as MerchantPromotionStatus)} style={styles.tab}>
                  <Text style={[styles.tabText, isActive && styles.activeTabText]}>{label}</Text>
                  {isActive ? <View style={styles.activeLine} /> : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.list}>
            {filteredPromotions.map((promotion) => (
              <View key={promotion.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{promotion.title}</Text>
                  {promotion.original_price ? (
                    <Text style={styles.oldPrice}>
                      De{' '}
                      {promotion.original_price.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </Text>
                  ) : null}
                  {promotion.discounted_price ? (
                    <Text style={styles.newPrice}>
                      Por{' '}
                      {promotion.discounted_price.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </Text>
                  ) : null}
                  <Text style={styles.badge}>{promotion.badge_text ?? formatPromotionDateRange(promotion.start_date, promotion.end_date)}</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable style={styles.actionButton}>
                    <Text style={styles.actionText}>Editar</Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      updatePromotionStatus(
                        promotion.id,
                        promotion.status === 'active' ? 'ended' : 'active',
                      )
                    }
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionText}>
                      {promotion.status === 'active' ? 'Pausar' : 'Reativar'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <Pressable accessibilityRole="button" onPress={() => router.push('/(merchant)/promotions/new')} style={styles.fab}>
          <Ionicons color={colors.white} name="add" size={28} />
        </Pressable>

        <MerchantBottomNav active="promotions" />
      </View>
    </SafeAreaView>
  );
}

function formatPromotionDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate).toLocaleDateString('pt-BR');
  const end = new Date(endDate).toLocaleDateString('pt-BR');

  return `${start} a ${end}`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: 10 },
  scrollContent: { paddingTop: 24, paddingBottom: 96, gap: spacing.md },
  header: { paddingVertical: 8 },
  title: { color: colors.textPrimary, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  tabs: { flexDirection: 'row', justifyContent: 'space-between' },
  tab: { flex: 1, alignItems: 'center', gap: 8, paddingBottom: 8 },
  tabText: { color: colors.textSecondary, fontSize: 14, lineHeight: 19, fontWeight: '400' },
  activeTabText: { color: colors.primary, fontWeight: '700' },
  activeLine: { width: '100%', height: 2, backgroundColor: colors.primary },
  list: { gap: spacing.md },
  card: {
    borderRadius: 12,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  cardContent: { gap: 4, padding: 12 },
  cardTitle: { color: colors.textPrimary, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  oldPrice: { color: colors.textMuted, fontSize: 12, lineHeight: 16, fontWeight: '400' },
  newPrice: { color: colors.primary, fontSize: 16, lineHeight: 21, fontWeight: '700' },
  badge: { color: colors.textSecondary, fontSize: 12, lineHeight: 16, fontWeight: '400' },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
  actionButton: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 40 },
  actionText: { color: '#4B5563', fontSize: 13, lineHeight: 18, fontWeight: '400' },
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
  },
});
