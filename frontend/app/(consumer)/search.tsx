import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChip } from '@/src/components/features/CategoryChip';
import { SearchResultRow } from '@/src/components/features/SearchResultRow';
import { FeaturedStoreCard } from '@/src/components/features/StoreCards';
import { BottomNav } from '@/src/components/ui/BottomNav';
import { ALL_CATEGORIES_CHIP } from '@/src/constants/categoryIcons';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { featuredStores, searchResults } from '@/src/mocks/consumer';
import { useCategories } from '@/src/queries/useCategories';
import { findFoodCategory, mapCategoryToChip } from '@/src/services/categories';
import { navigateToCategory } from '@/src/utils/navigation';

export default function ConsumerSearchScreen() {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORIES_CHIP.id);
  const { data: categories = [], isLoading } = useCategories();

  const searchCategoryChips = useMemo(() => {
    const foodCategory = findFoodCategory(categories);
    const subcategories = foodCategory?.children.map(mapCategoryToChip) ?? [];

    return [ALL_CATEGORIES_CHIP, ...subcategories];
  }, [categories]);

  function handleSearchCategoryPress(categoryId: string) {
    const foodCategory = findFoodCategory(categories);
    if (!foodCategory) {
      return;
    }

    setSelectedCategoryId(categoryId);

    if (categoryId === ALL_CATEGORIES_CHIP.id) {
      navigateToCategory(foodCategory.id, 'search');
      return;
    }

    navigateToCategory(foodCategory.id, 'search', { subcategoryId: categoryId });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.searchHeader}>
            <Pressable
              accessibilityLabel="Voltar"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
            </Pressable>
            <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
              <TextInput
                autoCapitalize="none"
                placeholder="Buscar lojas e produtos..."
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <FlatList
              data={searchCategoryChips}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CategoryChip
                  compact
                  label={item.label}
                  onPress={() => handleSearchCategoryPress(item.id)}
                  selected={selectedCategoryId === item.id}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.searchChipSeparator} />}
              showsHorizontalScrollIndicator={false}
            />
          )}

          <View style={styles.resultsPanel}>
            <Text style={styles.panelTitle}>Resultados em tempo real</Text>
            {searchResults.map((result, index) => (
              <SearchResultRow
                isLast={index === searchResults.length - 1}
                key={result.id}
                result={result}
                showIcon={index !== 3}
              />
            ))}
          </View>

          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>Lojas em destaque</Text>
            <View style={styles.featuredList}>
              {featuredStores.map((store) => (
                <FeaturedStoreCard
                  key={store.id}
                  onPress={() =>
                    router.push('/(consumer)/stores/loja-dos-calcados?origin=search' as never)
                  }
                  store={store}
                />
              ))}
            </View>
          </View>
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
    gap: spacing.lg,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralSoft,
  },
  searchBar: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md - 2,
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
  searchChipSeparator: {
    width: spacing.sm,
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
  featuredSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  featuredList: {
    gap: spacing.md,
  },
});
