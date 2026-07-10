import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StoreProfileProductCard } from '@/src/components/features/store/StoreProfileProductCard';
import { BottomNav, resolveBottomNavKey } from '@/src/components/ui/BottomNav';
import { colors, spacing } from '@/src/constants/tokens';
import { usePublicStore, useStoreProducts } from '@/src/queries/useDiscovery';
import { mapApiProductSummaryToProduct } from '@/src/utils/consumerMappers';
import { normalizeRouteParam } from '@/src/utils/routeParams';

export default function StoreProductsScreen() {
  const { id, origin } = useLocalSearchParams<{ id: string; origin?: string }>();
  const storeId = normalizeRouteParam(id);
  const activeBottomNav = resolveBottomNavKey(origin);
  const { data: apiStore, isLoading: isLoadingStore } = usePublicStore(storeId);
  const {
    data: apiProducts = [],
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useStoreProducts(storeId);

  const products = apiProducts.map(mapApiProductSummaryToProduct);
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
              <Text style={styles.title}>Produtos</Text>
              <Text style={styles.subtitle}>{storeName}</Text>
            </View>
          </View>

          {isLoadingStore || isLoadingProducts ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : isProductsError ? (
            <Text style={styles.emptyText}>Não foi possível carregar os produtos desta loja.</Text>
          ) : products.length === 0 ? (
            <Text style={styles.emptyText}>Esta loja ainda não cadastrou produtos.</Text>
          ) : (
            <View style={styles.productGrid}>
              {products.map((product) => (
                <StoreProfileProductCard
                  key={product.id}
                  origin={activeBottomNav}
                  product={product}
                />
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
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
});
