import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav, resolveBottomNavKey } from '@/src/components/ui/BottomNav';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { consumerStore, storeProducts } from '@/src/mocks/consumer';

export default function ProductDetailScreen() {
  const { id, origin } = useLocalSearchParams<{ id: string; origin?: string }>();
  const activeBottomNav = resolveBottomNavKey(origin);
  const product = storeProducts.find((item) => item.id === id) ?? storeProducts[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
          </Pressable>

          <Image source={{ uri: product.imageUrl }} style={styles.productImage} />

          <View style={styles.titleRow}>
            <View style={styles.titleColumn}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.category}>{product.category}</Text>
            </View>
            <Text style={styles.price}>{product.price}</Text>
          </View>

          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.storeRow}>
            <Image source={{ uri: consumerStore.avatarUrl }} style={styles.storeAvatar} />
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{consumerStore.name}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push(
                    `/(consumer)/stores/${consumerStore.id}?origin=${activeBottomNav}` as never,
                  )
                }
              >
                <Text style={styles.viewStoreLink}>Ver loja</Text>
              </Pressable>
            </View>
          </View>

          <Pressable accessibilityRole="button" style={styles.whatsAppButton}>
            <Ionicons color={colors.white} name="logo-whatsapp" size={20} />
            <Text style={styles.whatsAppText}>Chamar no WhatsApp</Text>
          </Pressable>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.neutralSoft,
  },
  productImage: {
    width: '100%',
    height: 280,
    borderRadius: radius.lg - 4,
    backgroundColor: colors.neutralSoft,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleColumn: {
    flex: 1,
    gap: 4,
  },
  productName: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  category: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  price: {
    color: colors.primary,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutralSoft,
  },
  storeInfo: {
    flex: 1,
    gap: 2,
  },
  storeName: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  viewStoreLink: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  whatsAppButton: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: '#25D366',
  },
  whatsAppText: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
});
