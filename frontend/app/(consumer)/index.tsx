import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import {
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
import { consumerCategories, nearbyStores } from '@/src/mocks/consumer';

export default function ConsumerHomeScreen() {
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
            <FlatList
              data={consumerCategories}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <CategoryChip
                  icon={item.icon}
                  label={item.label}
                  onPress={() =>
                    router.push(`/(consumer)/categories/${item.id}?origin=home` as never)
                  }
                  selected={index === 0}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.chipSeparator} />}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lojas próximas</Text>
            <View style={styles.storeList}>
              {nearbyStores.map((store) => (
                <NearbyStoreCard key={store.id} store={store} />
              ))}
            </View>
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
});
