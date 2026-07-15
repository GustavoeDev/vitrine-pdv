import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/constants/tokens';
import type { MerchantProduct } from '@/src/types/merchant';
import { formatCurrency } from '@/src/utils/merchantPromotions';

interface MerchantProductPriceProps {
  product: MerchantProduct;
  /** Slightly smaller for dashboard list */
  compact?: boolean;
}

export function MerchantProductPrice({ product, compact = false }: MerchantProductPriceProps) {
  const hasDiscount = Boolean(product.active_discount?.is_active);
  const displayPrice = hasDiscount
    ? product.active_discount!.discounted_price
    : product.price;

  if (!hasDiscount) {
    return (
      <Text style={[styles.price, compact ? styles.priceCompact : styles.priceCatalog]}>
        {formatCurrency(displayPrice)}
      </Text>
    );
  }

  return (
    <View style={styles.priceRow}>
      <Text style={[styles.originalPrice, compact && styles.originalPriceCompact]}>
        {formatCurrency(product.active_discount!.original_price)}
      </Text>
      <Text style={[styles.price, compact ? styles.priceCompact : styles.priceCatalog]}>
        {formatCurrency(displayPrice)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  originalPriceCompact: {
    fontSize: 12,
    lineHeight: 16,
  },
  price: {
    fontWeight: '700',
  },
  priceCompact: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  priceCatalog: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 20,
  },
});
