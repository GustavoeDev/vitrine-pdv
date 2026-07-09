import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomNavKey } from '@/src/components/ui/BottomNav';
import { colors, radius } from '@/src/constants/tokens';
import { Product } from '@/src/types';
import { formatProductPrice } from '@/src/utils/consumerMappers';

interface StoreProfileProductCardProps {
  origin: BottomNavKey;
  product: Product;
}

export function StoreProfileProductCard({ origin, product }: StoreProfileProductCardProps) {
  const hasDiscount = Boolean(product.active_discount?.is_active);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/(consumer)/products/${product.id}?origin=${origin}` as never)}
      style={styles.card}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
        {hasDiscount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>Promoção</Text>
          </View>
        ) : null}
      </View>
      <Text numberOfLines={1} style={styles.name}>
        {product.name}
      </Text>
      {hasDiscount && product.active_discount ? (
        <View style={styles.priceRow}>
          <Text style={styles.originalPrice}>
            {formatProductPrice(product.active_discount.original_price)}
          </Text>
          <Text style={styles.price}>{product.price}</Text>
        </View>
      ) : (
        <Text style={styles.price}>{product.price}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    gap: 4,
    padding: 6,
    borderRadius: radius.lg - 4,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  discountBadgeText: {
    color: colors.white,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  priceRow: {
    gap: 2,
  },
  originalPrice: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  price: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
});
