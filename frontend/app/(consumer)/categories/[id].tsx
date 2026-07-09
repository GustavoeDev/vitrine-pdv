import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChip } from '@/src/components/features/CategoryChip';
import { BottomNav, resolveBottomNavKey } from '@/src/components/ui/BottomNav';
import { colors, spacing } from '@/src/constants/tokens';
import { categoryStores } from '@/src/mocks/consumer';
import { Store } from '@/src/types';

const subcategories = ['Todos', 'Padarias', 'Mercados', 'Fazendas', 'Doces'];

function resolveCategoryTitle(id?: string | string[]) {
  const value = Array.isArray(id) ? id[0] : id;

  if (value === 'food' || value === 'all' || value === 'bakeries') {
    return 'Alimentação';
  }

  return 'Alimentação';
}

function CategoryStoreRow({ origin, store }: { origin: string; store: Store }) {
  const hasPromotion = store.id !== 'quitanda-da-praca';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/(consumer)/stores/loja-dos-calcados?origin=${origin}` as never)}
      style={styles.storeRow}
    >
      <Image source={{ uri: store.coverImageUrl }} style={styles.storeImage} />
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text style={styles.storeSubtitle}>{store.subcategory}</Text>
        <Text style={styles.storeMeta}>
          {store.distance} • {store.rating.toFixed(1)} ★
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
  const { id, origin } = useLocalSearchParams<{ id: string; origin?: string }>();
  const activeBottomNav = resolveBottomNavKey(origin);
  const originParam = activeBottomNav;

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
                <Text style={styles.title}>{resolveCategoryTitle(id)}</Text>
                <Text style={styles.subtitle}>Lojas selecionadas para sua região</Text>
              </View>
            </View>
            <Pressable accessibilityRole="button" style={styles.iconButton}>
              <Ionicons color={colors.textPrimary} name="options-outline" size={22} />
            </Pressable>
          </View>

          <FlatList
            data={subcategories}
            horizontal
            keyExtractor={(item) => item}
            renderItem={({ item, index }) => (
              <CategoryChip compact={false} label={item} selected={index === 0} />
            )}
            ItemSeparatorComponent={() => <View style={styles.chipSeparator} />}
            showsHorizontalScrollIndicator={false}
          />

          <View style={styles.list}>
            {categoryStores.map((store) => (
              <CategoryStoreRow key={store.id} origin={originParam} store={store} />
            ))}
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
});
