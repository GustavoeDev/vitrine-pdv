import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/tokens';
import type { ApiConsumerPromotion } from '@/src/services/promotions';
import { formatProductPrice } from '@/src/utils/consumerMappers';

const ROTATION_INTERVAL_MS = 5_000;

interface PromotionBannerProps {
  dailyPromotion?: ApiConsumerPromotion | null;
  favoritePromotions?: ApiConsumerPromotion[];
  onPress: (promotion: ApiConsumerPromotion) => void;
}

function resolveEyebrow(promotion: ApiConsumerPromotion): string {
  if (promotion.promotion_type === 'daily') {
    return 'PROMOÇÃO DO DIA';
  }

  return 'OFERTA DE LOJA FAVORITA';
}

function resolveSubtitle(promotion: ApiConsumerPromotion): string | null {
  if (promotion.promotion_type === 'product-discount' && promotion.discounted_price) {
    const original = promotion.original_price
      ? formatProductPrice(promotion.original_price)
      : null;
    const discounted = formatProductPrice(promotion.discounted_price);

    return original ? `${original} → ${discounted}` : discounted;
  }

  return null;
}

export function PromotionBanner({
  dailyPromotion,
  favoritePromotions = [],
  onPress,
}: PromotionBannerProps) {
  const [showDaily, setShowDaily] = useState(true);
  const [favoriteIndex, setFavoriteIndex] = useState(0);

  const canAlternate = Boolean(dailyPromotion) && favoritePromotions.length > 0;

  useEffect(() => {
    if (!canAlternate) {
      return;
    }

    const timer = setInterval(() => {
      setShowDaily((current) => {
        if (current) {
          return false;
        }

        setFavoriteIndex((index) => (index + 1) % favoritePromotions.length);
        return true;
      });
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [canAlternate, favoritePromotions.length]);

  const currentPromotion = useMemo(() => {
    if (dailyPromotion && favoritePromotions.length === 0) {
      return dailyPromotion;
    }

    if (!dailyPromotion && favoritePromotions.length > 0) {
      return favoritePromotions[favoriteIndex % favoritePromotions.length];
    }

    if (dailyPromotion && favoritePromotions.length > 0) {
      return showDaily
        ? dailyPromotion
        : favoritePromotions[favoriteIndex % favoritePromotions.length];
    }

    return null;
  }, [dailyPromotion, favoriteIndex, favoritePromotions, showDaily]);

  if (!currentPromotion) {
    return null;
  }

  const priceSubtitle = resolveSubtitle(currentPromotion);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(currentPromotion)}
      style={styles.banner}
    >
      {currentPromotion.image_url ? (
        <Image source={{ uri: currentPromotion.image_url }} style={styles.backgroundImage} />
      ) : null}
      <View style={styles.overlay}>
        <Text style={styles.eyebrow}>{resolveEyebrow(currentPromotion)}</Text>
        <Text numberOfLines={2} style={styles.title}>
          {currentPromotion.title}
        </Text>
        <Text style={styles.storeName}>{currentPromotion.store_name}</Text>
        {priceSubtitle ? <Text style={styles.priceSubtitle}>{priceSubtitle}</Text> : null}
        <View style={styles.offerButton}>
          <Text style={styles.offerButtonText}>Ver oferta</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    overflow: 'hidden',
    borderRadius: radius.lg - 4,
    backgroundColor: colors.primary,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  overlay: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'red',
    backgroundColor: 'rgba(249, 115, 22, 0.82)',
  },
  eyebrow: {
    color: colors.primarySoft,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  title: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  storeName: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  priceSubtitle: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 17,
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
  },
  offerButtonText: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
});
