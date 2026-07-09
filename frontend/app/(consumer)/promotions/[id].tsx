import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav, resolveBottomNavKey } from '@/src/components/ui/BottomNav';
import { DEFAULT_STORE_AVATAR } from '@/src/constants/images';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useAppModal } from '@/src/contexts/AppModalContext';
import { usePromotionDetail } from '@/src/queries/usePromotions';
import { formatProductPrice } from '@/src/utils/consumerMappers';
import { normalizeRouteParam } from '@/src/utils/routeParams';
import { openWhatsApp } from '@/src/utils/whatsapp';

export default function PromotionDetailScreen() {
  const { id, origin } = useLocalSearchParams<{ id: string; origin?: string }>();
  const promotionId = normalizeRouteParam(id);
  const activeBottomNav = resolveBottomNavKey(origin);
  const { showAlert } = useAppModal();
  const { data: promotion, isLoading, isError } = usePromotionDetail(promotionId);

  const isDailyPromotion = promotion?.promotion_type === 'daily';
  const headerTitle = isDailyPromotion ? 'Promoção do Dia' : 'Oferta especial';
  const imageUrl = promotion?.image_url ?? '';
  const avatarUrl = promotion?.store_avatar_url ?? DEFAULT_STORE_AVATAR;

  const handleWhatsAppPress = async () => {
    const phoneNumber = promotion?.phone_number ?? '';

    if (!phoneNumber) {
      await showAlert({
        title: 'WhatsApp indisponível',
        subtitle: 'Esta loja ainda não informou um telefone.',
      });
      return;
    }

    const message = promotion
      ? `Olá! Vi a promoção ${promotion.title} da loja ${promotion.store_name} no VitrinePDV.`
      : 'Olá! Vi uma promoção no VitrinePDV e gostaria de mais informações.';

    const opened = await openWhatsApp(phoneNumber, message);

    if (!opened) {
      await showAlert({
        title: 'WhatsApp indisponível',
        subtitle: 'Não foi possível abrir o WhatsApp neste dispositivo.',
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !promotion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Promoção não encontrada</Text>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.headerTitle}>{headerTitle}</Text>
          </View>

          <View style={styles.bannerWrap}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.bannerImage} />
            ) : (
              <View style={[styles.bannerImage, styles.bannerFallback]} />
            )}
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>OFERTA</Text>
            </View>
          </View>

          <Text style={styles.title}>{promotion.title}</Text>

          {promotion.discounted_price ? (
            <Text style={styles.priceHighlight}>
              {promotion.original_price
                ? `${formatProductPrice(promotion.original_price)} → ${formatProductPrice(promotion.discounted_price)}`
                : formatProductPrice(promotion.discounted_price)}
            </Text>
          ) : null}

          <View style={styles.storeRow}>
            <View style={styles.storeLeft}>
              <Image source={{ uri: avatarUrl }} style={styles.storeAvatar} />
              <View>
                <Text style={styles.storeName}>{promotion.store_name}</Text>
                <Text style={styles.storeSubtitle}>{promotion.store_subtitle}</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push(
                  `/(consumer)/stores/${promotion.store_id}?origin=${activeBottomNav}` as never,
                )
              }
              style={styles.viewStoreLink}
            >
              <Text style={styles.viewStoreText}>Ver loja</Text>
              <Ionicons color={colors.primary} name="arrow-forward" size={16} />
            </Pressable>
          </View>

          <Text style={styles.description}>{promotion.description}</Text>

          <View style={styles.validityRow}>
            <Ionicons color={colors.danger} name="time-outline" size={18} />
            <Text style={styles.validityText}>Válido até {promotion.valid_until}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => void handleWhatsAppPress()}
            style={styles.whatsAppButton}
          >
            <Ionicons color={colors.white} name="logo-whatsapp" size={20} />
            <Text style={styles.whatsAppText}>Chamar no WhatsApp</Text>
          </Pressable>

          {promotion.product_id ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push(
                  `/(consumer)/products/${promotion.product_id}?origin=${activeBottomNav}` as never,
                )
              }
              style={styles.fullStoreButton}
            >
              <Text style={styles.fullStoreText}>Ver produto</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push(
                  `/(consumer)/stores/${promotion.store_id}?origin=${activeBottomNav}` as never,
                )
              }
              style={styles.fullStoreButton}
            >
              <Text style={styles.fullStoreText}>Ver loja completa</Text>
            </Pressable>
          )}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  backLink: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    color: colors.primary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
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
  bannerFallback: {
    backgroundColor: colors.primarySoft,
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
  priceHighlight: {
    color: colors.primary,
    fontSize: 18,
    lineHeight: 24,
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
