import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantBottomNav } from '@/src/components/merchant/MerchantBottomNav';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useMerchant, useMerchantStats } from '@/src/contexts/MerchantContext';

function QuickAction({
  icon,
  label,
  primary = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  primary?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.quickAction, primary ? styles.quickActionPrimary : styles.quickActionNeutral]}
    >
      <Ionicons
        color={primary ? colors.white : colors.textSecondary}
        name={icon}
        size={20}
      />
      <Text style={[styles.quickActionText, primary && styles.quickActionTextPrimary]}>{label}</Text>
    </Pressable>
  );
}

export default function MerchantDashboardScreen() {
  const { profile, products } = useMerchant();
  const stats = useMerchantStats();
  const storeName = profile.store.name;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Ola, {storeName}</Text>
            <Text style={styles.subtitle}>Seu painel de vitrine digital</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Ionicons color={colors.primary} name="eye-outline" size={20} />
              </View>
              <Text style={styles.statValue}>{stats.views}</Text>
              <Text style={styles.statLabel}>Visualizacoes</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Ionicons color={colors.primary} name="heart-outline" size={20} />
              </View>
              <Text style={styles.statValue}>{stats.favorites}</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acoes rapidas</Text>
            <View style={styles.quickGrid}>
              <QuickAction
                icon="add"
                label="Novo Produto"
                onPress={() => router.push('/(merchant)/catalog/new')}
                primary
              />
              <QuickAction
                icon="megaphone-outline"
                label="Nova Promocao"
                onPress={() => router.push('/(merchant)/promotions/new')}
              />
              <QuickAction
                icon="file-tray-outline"
                label="Meu Catalogo"
                onPress={() => router.push('/(merchant)/catalog')}
              />
              <QuickAction
                icon="bar-chart-outline"
                label="Estatisticas"
                onPress={() => router.push('/(merchant)/stats')}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ultimos produtos</Text>
            <View style={styles.list}>
              {products.slice(0, 3).map((product) => (
                <View key={product.id} style={styles.productRow}>
                  <Image source={{ uri: product.photo_url ?? '' }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>
                      {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      product.is_active ? styles.activePill : styles.inactivePill,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        product.is_active ? styles.activeText : styles.inactiveText,
                      ]}
                    >
                      {product.is_active ? 'Ativo' : 'Inativo'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
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
  header: { gap: 4 },
  title: { color: colors.textPrimary, fontSize: 22, lineHeight: 28, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 20, fontWeight: '400' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  statValue: { color: colors.primary, fontSize: 28, lineHeight: 34, fontWeight: '700' },
  statLabel: { color: colors.textSecondary, fontSize: 15, lineHeight: 20, fontWeight: '400' },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, lineHeight: 22, fontWeight: '700' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickAction: {
    width: '48.5%',
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  quickActionPrimary: { backgroundColor: colors.primary },
  quickActionNeutral: { backgroundColor: colors.neutralSoft },
  quickActionText: { flex: 1, color: colors.textPrimary, fontSize: 16, lineHeight: 21, fontWeight: '700' },
  quickActionTextPrimary: { color: colors.white },
  list: { gap: 10 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  productImage: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.neutralSoft },
  productInfo: { flex: 1, gap: 2 },
  productName: { color: colors.textPrimary, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  productPrice: { color: colors.textSecondary, fontSize: 15, lineHeight: 20, fontWeight: '400' },
  statusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
  activePill: { backgroundColor: '#DCFCE7' },
  inactivePill: { backgroundColor: colors.neutralSoft },
  statusText: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
  activeText: { color: '#166534' },
  inactiveText: { color: colors.textSecondary },
});
