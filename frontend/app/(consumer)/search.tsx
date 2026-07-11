import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryCircleTile } from '@/src/components/features/CategoryCircleTile';
import { SearchResultRow } from '@/src/components/features/SearchResultRow';
import { FeaturedStoreCard } from '@/src/components/features/StoreCards';
import { BottomNav } from '@/src/components/ui/BottomNav';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useCategories } from '@/src/queries/useCategories';
import { usePublicStores, useSearch } from '@/src/queries/useDiscovery';
import type { ApiCategory } from '@/src/types/category';
import { SearchResult } from '@/src/types';
import { mapApiPublicStoreToStore } from '@/src/utils/consumerMappers';
import { navigateToCategory } from '@/src/utils/navigation';

const FEATURED_STORES_LIMIT = 5;
const CHILDREN_PREVIEW_LIMIT = 8;

function CategorySection({
  category,
  onSeeMore,
  onChildPress,
}: {
  category: ApiCategory;
  onSeeMore: () => void;
  onChildPress: (childId: string) => void;
}) {
  const children = category.children.slice(0, CHILDREN_PREVIEW_LIMIT);

  if (children.length === 0) {
    return null;
  }

  return (
    <View style={styles.categorySection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{category.name}</Text>
        <Pressable accessibilityRole="button" onPress={onSeeMore}>
          <Text style={styles.seeMoreLink}>Ver mais</Text>
        </Pressable>
      </View>

      <View style={styles.categoryGrid}>
        {children.map((child) => (
          <View key={child.id} style={styles.categoryGridItem}>
            <CategoryCircleTile
              label={child.name}
              onPress={() => onChildPress(child.id)}
              photoUrl={child.photo_url}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ConsumerSearchScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: apiStores = [], isLoading: isLoadingStores } = usePublicStores({
    limit: FEATURED_STORES_LIMIT,
  });
  const { data: searchResults = [], isFetching: isSearching } = useSearch(debouncedQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const isSearchingActive = debouncedQuery.trim().length >= 2;

  const featuredStoreItems = useMemo(
    () => apiStores.map(mapApiPublicStoreToStore),
    [apiStores],
  );

  const mappedSearchResults: SearchResult[] = useMemo(
    () =>
      searchResults.map((result) => ({
        id: result.id,
        type: result.type,
        title: result.title,
        subtitle: result.subtitle,
        store_id: result.store_id,
      })),
    [searchResults],
  );

  function handleSearchResultPress(result: SearchResult) {
    if (result.type === 'store') {
      router.push(`/(consumer)/stores/${result.id}?origin=search` as never);
      return;
    }

    router.push(`/(consumer)/products/${result.id}?origin=search` as never);
  }

  function handleParentPress(categoryId: string) {
    navigateToCategory(categoryId, 'search');
  }

  function handleChildPress(parentId: string, childId: string) {
    navigateToCategory(parentId, 'search', { subcategoryId: childId });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
            <Ionicons color={colors.textMuted} name="search-outline" size={20} />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={() => setIsFocused(false)}
              onChangeText={setQuery}
              onFocus={() => setIsFocused(true)}
              placeholder="Buscar lojas e produtos..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              value={query}
            />
            {query.length > 0 ? (
              <Pressable
                accessibilityLabel="Limpar busca"
                accessibilityRole="button"
                onPress={() => setQuery('')}
              >
                <Ionicons color={colors.textMuted} name="close-circle" size={20} />
              </Pressable>
            ) : null}
          </View>

          {isSearchingActive ? (
            <View style={styles.resultsPanel}>
              <Text style={styles.panelTitle}>Resultados em tempo real</Text>
              {isSearching ? <ActivityIndicator color={colors.primary} /> : null}
              {!isSearching && mappedSearchResults.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum resultado para &quot;{debouncedQuery}&quot;.</Text>
              ) : null}
              {mappedSearchResults.map((result, index) => (
                <SearchResultRow
                  isLast={index === mappedSearchResults.length - 1}
                  key={`${result.type}-${result.id}`}
                  onPress={() => handleSearchResultPress(result)}
                  result={result}
                />
              ))}
            </View>
          ) : (
            <>
              {isLoadingCategories ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <View style={styles.parentSection}>
                    <Text style={styles.sectionTitle}>Categorias</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.parentRow}
                    >
                      {categories.map((category) => (
                        <View key={category.id} style={styles.parentTile}>
                          <CategoryCircleTile
                            label={category.name}
                            onPress={() => handleParentPress(category.id)}
                            photoUrl={category.photo_url}
                          />
                        </View>
                      ))}
                    </ScrollView>
                  </View>

                  {categories.map((category) => (
                    <CategorySection
                      category={category}
                      key={category.id}
                      onChildPress={(childId) => handleChildPress(category.id, childId)}
                      onSeeMore={() => handleParentPress(category.id)}
                    />
                  ))}
                </>
              )}

              <View style={styles.featuredSection}>
                <Text style={styles.sectionTitle}>Lojas em destaque</Text>
                {isLoadingStores ? <ActivityIndicator color={colors.primary} /> : null}
                {!isLoadingStores && featuredStoreItems.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhuma loja disponível no momento.</Text>
                ) : null}
                <View style={styles.featuredList}>
                  {featuredStoreItems.map((store) => (
                    <FeaturedStoreCard
                      key={store.id}
                      onPress={() =>
                        router.push(`/(consumer)/stores/${store.id}?origin=search` as never)
                      }
                      store={store}
                    />
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>

        <BottomNav active="search" />
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
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  searchBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.background,
  },
  searchBarFocused: {
    borderColor: colors.primary,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    padding: 0,
  },
  parentSection: {
    gap: spacing.sm,
  },
  parentRow: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  parentTile: {
    width: 88,
  },
  categorySection: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  seeMoreLink: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryGridItem: {
    width: '25%',
    paddingHorizontal: 4,
  },
  resultsPanel: {
    width: '100%',
    gap: spacing.sm,
    padding: 12,
    borderRadius: radius.lg - 4,
    backgroundColor: colors.surface,
  },
  panelTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
  },
  featuredSection: {
    gap: spacing.sm,
  },
  featuredList: {
    gap: spacing.md,
  },
});
