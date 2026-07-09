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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChip } from '@/src/components/features/CategoryChip';
import { NearbyStoreCard } from '@/src/components/features/StoreCards';
import { BottomNav } from '@/src/components/ui/BottomNav';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useCategories } from '@/src/queries/useCategories';
import { usePublicStores } from '@/src/queries/useDiscovery';
import { mapRootCategoriesToChips } from '@/src/services/categories';
import { mapApiPublicStoreToStore } from '@/src/utils/consumerMappers';
import { navigateToCategory } from '@/src/utils/navigation';
import { getTopRatedStores, HOME_STORES_PREVIEW_LIMIT } from '@/src/utils/storeFilters';

export default function ConsumerHomeScreen() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: apiStores = [] } = usePublicStores({ limit: 20 });
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const categoryChips = useMemo(() => mapRootCategoriesToChips(categories), [categories]);

  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return null;
    }

    return categoryChips.find((chip) => chip.id === selectedCategoryId)?.label ?? null;
  }, [categoryChips, selectedCategoryId]);

  const topRatedStores = useMemo(() => {
    if (apiStores.length > 0) {
      const mappedStores = apiStores.map(mapApiPublicStoreToStore);
      const filtered =
        selectedCategoryLabel === null
          ? mappedStores
          : mappedStores.filter((store) => store.category === selectedCategoryLabel);

      return filtered;
    }

    return getTopRatedStores(selectedCategoryLabel);
  }, [apiStores, selectedCategoryLabel]);

  const previewStores = useMemo(
    () => topRatedStores.slice(0, HOME_STORES_PREVIEW_LIMIT),
    [topRatedStores],
  );

  const storesSectionTitle = selectedCategoryLabel
    ? `Lojas mais avaliadas em ${selectedCategoryLabel}`
    : 'Lojas mais avaliadas';

  function handleSeeMore() {
    navigateToCategory(selectedCategoryId, 'home');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.greeting}>
              <Text style={styles.title}>Olá, Maria 👋</Text>
              <Text style={styles.subtitle}>Encontre lojas e produtos perto de você</Text>
            </View>
            <Pressable
              accessibilityLabel="Abrir notificações"
              accessibilityRole="button"
              onPress={() => router.push('./notifications')}
              style={styles.notificationButton}
            >
              <Ionicons color={colors.textPrimary} name="notifications-outline" size={24} />
              <View style={styles.notificationDot} />
            </Pressable>
          </View>

          <View style={styles.promoBanner}>
            <Text style={styles.promoEyebrow}>🔥 PROMOÇÃO DO DIA</Text>
            <Text style={styles.promoTitle}>A oferta mais quente do bairro</Text>
            <Text style={styles.promoStore}>Padaria São José</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push('/(consumer)/promotions/cafe-da-manha-especial?origin=home' as never)
              }
              style={styles.offerButton}
            >
              <Text style={styles.offerButtonText}>Ver oferta</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categorias</Text>
            {isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <FlatList
                data={categoryChips}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <CategoryChip
                    icon={item.icon}
                    iconOutline={item.iconOutline}
                    label={item.label}
                    onPress={() => setSelectedCategoryId(item.id)}
                    photoUrl={item.photo_url}
                    selected={selectedCategoryId === item.id}
                  />
                )}
                ItemSeparatorComponent={() => <View style={styles.chipSeparator} />}
                showsHorizontalScrollIndicator={false}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{storesSectionTitle}</Text>
            {previewStores.length > 0 ? (
              <View style={styles.storeList}>
                {previewStores.map((store) => (
                  <NearbyStoreCard
                    key={store.id}
                    onPress={() =>
                      router.push(`/(consumer)/stores/${store.id}?origin=home` as never)
                    }
                    store={store}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                Nenhuma loja encontrada nesta categoria por enquanto.
              </Text>
            )}

            {topRatedStores.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={handleSeeMore}
                style={styles.seeMoreButton}
              >
                <Text style={styles.seeMoreText}>Ver mais</Text>
                <Ionicons color={colors.primary} name="arrow-forward" size={18} />
              </Pressable>
            ) : null}
          </View>
        </ScrollView>

        <BottomNav active="home" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  greeting: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralSoft,
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  promoBanner: {
    height: 123,
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg - 4,
    backgroundColor: colors.primary,
  },
  promoEyebrow: {
    color: colors.primarySoft,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  promoTitle: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  promoStore: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  offerButton: {
    minWidth: 104,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 4,
  },
  offerButtonText: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  chipSeparator: {
    width: 6,
  },
  storeList: {
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
  },
  seeMoreButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  seeMoreText: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
});
