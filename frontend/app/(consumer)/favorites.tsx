import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FavoriteStoreCard } from '@/src/components/features/StoreCards';
import { BottomNav } from '@/src/components/ui/BottomNav';
import { colors, spacing } from '@/src/constants/tokens';
import { favoriteStores } from '@/src/mocks/consumer';

export default function FavoritesScreen() {
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
              <Text style={styles.count}>(3 lojas)</Text>
            </View>
          </View>

          <View style={styles.list}>
            {favoriteStores.map((store) => (
              <FavoriteStoreCard key={store.id} store={store} />
            ))}
          </View>
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
});
