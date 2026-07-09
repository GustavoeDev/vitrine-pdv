import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text } from 'react-native';

import { BottomNavKey } from '@/src/components/ui/BottomNav';
import { colors, radius } from '@/src/constants/tokens';
import { Product } from '@/src/types';

interface StoreProfileProductCardProps {
  origin: BottomNavKey;
  product: Product;
}

export function StoreProfileProductCard({ origin, product }: StoreProfileProductCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/(consumer)/products/${product.id}?origin=${origin}` as never)}
      style={styles.card}
    >
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <Text numberOfLines={1} style={styles.name}>
        {product.name}
      </Text>
      <Text style={styles.price}>{product.price}</Text>
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
  image: {
    width: '100%',
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  price: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
});
