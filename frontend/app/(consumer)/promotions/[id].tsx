import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav, resolveBottomNavKey } from '@/src/components/ui/BottomNav';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { promotionOfTheDay } from '@/src/mocks/consumer';

export default function PromotionDetailScreen() {
  const { origin } = useLocalSearchParams<{ id: string; origin?: string }>();
  const activeBottomNav = resolveBottomNavKey(origin);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Voltar"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
            </Pressable>
            <Text style={styles.headerTitle}>Promoção do Dia</Text>
          </View>

          <View style={styles.bannerWrap}>
            <Image source={{ uri: promotionOfTheDay.imageUrl }} style={styles.bannerImage} />
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>OFERTA</Text>
            </View>
          </View>

          <Text style={styles.title}>{promotionOfTheDay.title}</Text>

          <View style={styles.storeRow}>
            <View style={styles.storeLeft}>
              <Image source={{ uri: promotionOfTheDay.storeAvatarUrl }} style={styles.storeAvatar} />
              <View>
                <Text style={styles.storeName}>{promotionOfTheDay.storeName}</Text>
                <Text style={styles.storeSubtitle}>{promotionOfTheDay.storeSubtitle}</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push(
                  `/(consumer)/stores/${promotionOfTheDay.storeId}?origin=${activeBottomNav}` as never,
                )
              }
              style={styles.viewStoreLink}
            >
              <Text style={styles.viewStoreText}>Ver loja</Text>
              <Ionicons color={colors.primary} name="arrow-forward" size={16} />
            </Pressable>
          </View>

          <Text style={styles.description}>{promotionOfTheDay.description}</Text>

          <View style={styles.validityRow}>
            <Ionicons color={colors.danger} name="time-outline" size={18} />
            <Text style={styles.validityText}>
              Válido até {promotionOfTheDay.validUntil}
            </Text>
          </View>

          <Pressable accessibilityRole="button" style={styles.whatsAppButton}>
            <Ionicons color={colors.white} name="logo-whatsapp" size={20} />
            <Text style={styles.whatsAppText}>Chamar no WhatsApp</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push(
                `/(consumer)/stores/${promotionOfTheDay.storeId}?origin=${activeBottomNav}` as never,
              )
            }
            style={styles.fullStoreButton}
          >
            <Text style={styles.fullStoreText}>Ver loja completa</Text>
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
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.neutralSoft,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  bannerWrap: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
    borderRadius: radius.lg,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutralSoft,
  },
  offerBadge: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  offerBadgeText: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  storeLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutralSoft,
  },
  storeName: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  storeSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  viewStoreLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewStoreText: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  description: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  validityText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
  },
  whatsAppButton: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#25D366',
  },
  whatsAppText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  fullStoreButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  fullStoreText: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
});
