import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChip } from '@/src/components/features/CategoryChip';
import { BottomNav, resolveBottomNavKey } from '@/src/components/ui/BottomNav';
import { colors, spacing } from '@/src/constants/tokens';
import { useCategories, useCategory } from '@/src/queries/useCategories';
import { usePublicStores } from '@/src/queries/useDiscovery';
import { findCategoryById, resolveCategoryRoute } from '@/src/services/categories';
import { Store } from '@/src/types';
import type { ApiCategory } from '@/src/types/category';
import { mapApiPublicStoreToStore } from '@/src/utils/consumerMappers';
import { sortStoresByRating } from '@/src/utils/storeFilters';

function CategoryStoreRow({ origin, store }: { origin: string; store: Store }) {
  const hasPromotion = false;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/(consumer)/stores/${store.id}?origin=${origin}` as never)}
      style={styles.storeRow}
    >
      <Image source={{ uri: store.coverImageUrl }} style={styles.storeImage} />
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text style={styles.storeSubtitle}>{store.subcategory}</Text>
        <Text style={styles.storeMeta}>
          {store.distance} • {(store.rating ?? 0).toFixed(1)} ★
        </Text>
        {hasPromotion ? (
          <View style={styles.promoBadge}>
            <Text style={styles.promoBadgeText}>Promoção ativa</Text>
          </View>
        ) : null}
      </View>
      <Ionicons color={colors.textSecondary} name="heart-outline" size={24} />
    </Pressable>
  );
}

export default function CategoryStoresScreen() {
  const { id: rawId, origin, subcategoryId: subcategoryIdParam } = useLocalSearchParams<{
    id: string;
    origin?: string;
    subcategoryId?: string;
  }>();
  const activeBottomNav = resolveBottomNavKey(origin);
  const originParam = activeBottomNav;
  const { data: allCategories = [], isLoading: isLoadingCategories } = useCategories();

  const { parentId, initialSubcategoryId } = useMemo(
    () => resolveCategoryRoute(rawId ?? 'all', allCategories),
    [allCategories, rawId],
  );

  const { data: categoryDetail, isLoading: isLoadingDetail } = useCategory(
    parentId !== 'all' ? parentId : undefined,
  );

  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string | null>(null);

  const parentCategory = useMemo(() => {
    if (parentId === 'all') {
      return undefined;
    }

    return categoryDetail ?? findCategoryById(allCategories, parentId);
  }, [allCategories, categoryDetail, parentId]);

  const subcategoryItems = useMemo((): ApiCategory[] => {
    if (parentId === 'all') {
      return allCategories;
    }

    return parentCategory?.children ?? [];
  }, [allCategories, parentCategory?.children, parentId]);

  const subcategoryLabels = useMemo(
    () => ['Todos', ...subcategoryItems.map((item) => item.name)],
    [subcategoryItems],
  );

  const title = useMemo(() => {
    if (parentId === 'all') {
      return 'Todas as categorias';
    }

    return parentCategory?.name ?? 'Categoria';
  }, [parentCategory?.name, parentId]);

  const isLoading =
    isLoadingCategories || (parentId !== 'all' && isLoadingDetail);

  const activeChild = useMemo(() => {
    if (!parentCategory || !activeSubcategoryId) {
      return null;
    }

    return parentCategory.children.find((child) => child.id === activeSubcategoryId) ?? null;
  }, [activeSubcategoryId, parentCategory]);

  const storeFilters = useMemo(() => {
    if (parentId === 'all') {
      if (!activeSubcategoryId) {
        return {};
      }

      return { categoryId: activeSubcategoryId };
    }

    if (activeChild) {
      return {
        categoryId: parentId,
        subcategory: activeChild.name,
      };
    }

    return { categoryId: parentId };
  }, [activeChild, activeSubcategoryId, parentId]);

  const { data: apiStores = [], isLoading: isLoadingStores } = usePublicStores(storeFilters);

  const topRatedStores = useMemo(() => {
    return sortStoresByRating(apiStores.map(mapApiPublicStoreToStore));
  }, [apiStores]);

  useEffect(() => {
    const paramSubcategoryId = Array.isArray(subcategoryIdParam)
      ? subcategoryIdParam[0]
      : subcategoryIdParam;

    setActiveSubcategoryId(paramSubcategoryId ?? initialSubcategoryId ?? null);
  }, [initialSubcategoryId, parentId, subcategoryIdParam]);

  function handleSubcategoryPress(label: string) {
    if (label === 'Todos') {
      setActiveSubcategoryId(null);
      return;
    }

    const match = subcategoryItems.find((item) => item.name === label);
    if (match) {
      setActiveSubcategoryId(match.id);
    }
  }

  function isSubcategorySelected(label: string): boolean {
    if (label === 'Todos') {
      return activeSubcategoryId === null;
    }

    const match = subcategoryItems.find((item) => item.name === label);
    return match?.id === activeSubcategoryId;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.leftHeader}>
              <Pressable
                accessibilityLabel="Voltar"
                accessibilityRole="button"
                onPress={() => router.back()}
                style={styles.iconButton}
              >
                <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
              </Pressable>
              <View style={styles.titleWrap}>
                {isLoading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>Lojas mais avaliadas na região</Text>
                  </>
                )}
              </View>
            </View>
            <Pressable accessibilityRole="button" style={styles.iconButton}>
              <Ionicons color={colors.textPrimary} name="options-outline" size={22} />
            </Pressable>
          </View>

          {!isLoading ? (
            <FlatList
              data={subcategoryLabels}
              horizontal
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <CategoryChip
                  compact={false}
                  label={item}
                  onPress={() => handleSubcategoryPress(item)}
                  selected={isSubcategorySelected(item)}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.chipSeparator} />}
              showsHorizontalScrollIndicator={false}
            />
          ) : null}

          <View style={styles.list}>
            {isLoadingStores ? <ActivityIndicator color={colors.primary} /> : null}
            {topRatedStores.length > 0 ? (
              topRatedStores.map((store) => (
                <CategoryStoreRow key={store.id} origin={originParam} store={store} />
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhuma loja encontrada nesta categoria.</Text>
            )}
          </View>
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
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  leftHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
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
  chipSeparator: {
    width: spacing.sm,
  },
  list: {
    width: '100%',
  },
  storeRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  storeImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: colors.neutralSoft,
  },
  storeInfo: {
    flex: 1,
    gap: 4,
  },
  storeName: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },
  storeSubtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  storeMeta: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  promoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  promoBadgeText: {
    color: colors.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
  },
});
