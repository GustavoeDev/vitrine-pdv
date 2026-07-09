import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FavoriteStoreCard } from '@/src/components/features/StoreCards';
import { BottomNav } from '@/src/components/ui/BottomNav';
import { colors, spacing } from '@/src/constants/tokens';
import { useFavorites } from '@/src/queries/usePromotions';
import { DEFAULT_STORE_COVER } from '@/src/constants/images';
import { Store } from '@/src/types';
import type { ApiFavoriteStore } from '@/src/services/favorites';

function mapFavoriteToStore(favorite: ApiFavoriteStore): Store {
  return {
    id: favorite.id,
    name: favorite.name,
    category: favorite.category_name,
    subcategory: favorite.subcategory || favorite.category_name,
    distance: 'Favorita',
    rating: 4.5,
    reviews: 0,
    coverImageUrl: favorite.cover_photo_url ?? DEFAULT_STORE_COVER,
    avatarUrl: favorite.logo_url ?? favorite.cover_photo_url ?? DEFAULT_STORE_COVER,
  };
}

export default function FavoritesScreen() {
  const { data: favorites = [], isLoading, isError } = useFavorites();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <Text style={styles.title}>Favoritos</Text>
              <Text style={styles.count}>({favorites.length} lojas)</Text>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : isError ? (
            <Text style={styles.emptyText}>Não foi possível carregar seus favoritos.</Text>
          ) : favorites.length === 0 ? (
            <Text style={styles.emptyText}>
              Você ainda não favoritou nenhuma loja. Toque no coração no perfil da loja para salvar aqui.
            </Text>
          ) : (
            <View style={styles.list}>
              {favorites.map((favorite) => (
                <FavoriteStoreCard
                  key={favorite.id}
                  hasActivePromotion={favorite.has_active_promotion}
                  onPress={() =>
                    router.push(`/(consumer)/stores/${favorite.id}?origin=favorites` as never)
                  }
                  store={mapFavoriteToStore(favorite)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <BottomNav active="favorites" />
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
    gap: 10,
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
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  count: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
  list: {
    gap: 10,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
  },
});
