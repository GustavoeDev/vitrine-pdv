import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantBottomNav } from '@/src/components/merchant/MerchantBottomNav';
import { MerchantProductPrice } from '@/src/components/merchant/MerchantProductPrice';
import { CategoryChip } from '@/src/components/features/CategoryChip';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useAppModal } from '@/src/contexts/AppModalContext';
import { useMerchant } from '@/src/contexts/MerchantContext';
import { MerchantCatalogFilter } from '@/src/types/merchant';

export default function MerchantCatalogScreen() {
  const {
    activeStoreName,
    products,
    isLoadingProducts,
    isSavingProduct,
    toggleProduct,
    deleteProduct,
  } = useMerchant();
  const { showAlert, showConfirm } = useAppModal();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MerchantCatalogFilter>('all');

  const handleDeleteProduct = async (productId: string) => {
    const confirmed = await showConfirm({
      title: 'Excluir produto',
      subtitle: 'Deseja remover este produto?',
      confirmLabel: 'Excluir',
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(productId);
    } catch {
      await showAlert({
        title: 'Erro',
        subtitle: 'Não foi possível excluir o produto.',
      });
    }
  };

  const handleToggleProduct = async (productId: string) => {
    try {
      await toggleProduct(productId);
    } catch {
      await showAlert({
        title: 'Erro',
        subtitle: 'Não foi possível atualizar o status do produto.',
      });
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        filter === 'all' ? true : filter === 'active' ? product.is_active : !product.is_active;

      return matchesQuery && matchesFilter;
    });
  }, [filter, products, query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Meu Catálogo</Text>
              <Text style={styles.subtitle}>
                {activeStoreName ? `Loja: ${activeStoreName} · ` : ''}
                {products.length} produtos - {products.filter((product) => product.is_active).length} ativos
              </Text>
            </View>
          </View>

          <View style={styles.searchBar}>
            <TextInput
              onChangeText={setQuery}
              placeholder="Filtrar produtos..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              value={query}
            />
          </View>

          <View style={styles.filters}>
            <CategoryChip compact label="Todos" onPress={() => setFilter('all')} selected={filter === 'all'} />
            <CategoryChip compact label="Ativos" onPress={() => setFilter('active')} selected={filter === 'active'} />
            <CategoryChip compact label="Inativos" onPress={() => setFilter('inactive')} selected={filter === 'inactive'} />
          </View>

          {isLoadingProducts ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>
                {products.length === 0
                  ? 'Nenhum produto cadastrado ainda.'
                  : 'Nenhum produto encontrado com esse filtro.'}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {filteredProducts.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <Image source={{ uri: product.photo_url ?? '' }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <MerchantProductPrice product={product} />
                  </View>
                  <Switch
                    disabled={isSavingProduct}
                    ios_backgroundColor={colors.border}
                    onValueChange={() => void handleToggleProduct(product.id)}
                    thumbColor={colors.white}
                    trackColor={{ false: colors.border, true: '#DCFCE7' }}
                    value={product.is_active}
                  />
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSavingProduct}
                    onPress={() => void handleDeleteProduct(product.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteText}>Excluir</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <Pressable accessibilityRole="button" onPress={() => router.push('/(merchant)/catalog/new')} style={styles.fab}>
          <Ionicons color={colors.white} name="add" size={28} />
        </Pressable>

        <MerchantBottomNav active="catalog" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: 10 },
  scrollContent: { paddingTop: 24, paddingBottom: 96, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.textPrimary, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 19, fontWeight: '400' },
  searchBar: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  searchInput: { color: colors.textPrimary, fontSize: 15, lineHeight: 20, fontWeight: '400', padding: 0 },
  filters: { flexDirection: 'row', gap: spacing.sm },
  list: { gap: spacing.sm },
  loadingWrap: { paddingVertical: 48, alignItems: 'center' },
  emptyWrap: { paddingVertical: 48, alignItems: 'center' },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  productCard: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  productImage: { width: 60, height: 60, borderRadius: 16, backgroundColor: colors.neutralSoft },
  productInfo: { flex: 1, gap: 2 },
  productName: { color: colors.textPrimary, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  deleteButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: '#FEE2E2' },
  deleteText: { color: '#DC2626', fontSize: 12, lineHeight: 16, fontWeight: '700' },
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
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
});
