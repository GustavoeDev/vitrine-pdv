import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/tokens';
import type { MapStore } from '@/src/types/map';
import { formatDistanceLabel } from '@/src/utils/geo';

interface MapStoreSheetProps {
  store: MapStore | null;
  onViewStore: (storeId: string) => void;
}

export function MapStoreSheet({ onViewStore, store }: MapStoreSheetProps) {
  if (!store) {
    return (
      <View style={styles.emptySheet}>
        <Text style={styles.emptyText}>Selecione uma loja no mapa para ver os detalhes.</Text>
      </View>
    );
  }

  return (
    <View style={styles.sheet}>
      <View style={styles.dragHandle} />
      <View style={styles.cardContent}>
        <Image source={{ uri: store.avatarUrl }} style={styles.storeImage} />
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text style={styles.storeSubtitle}>
            {store.category} • {store.subcategory}
          </Text>
          <Text style={styles.distanceText}>📍 {formatDistanceLabel(store.distanceKm)}</Text>
          <Text style={styles.reviewText}>
            ⭐ {store.rating.toFixed(1)} • {store.reviews} avaliações
          </Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => onViewStore(store.id)}
        style={styles.viewStoreButton}
      >
        <Text style={styles.viewStoreText}>Ver loja</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderTopLeftRadius: radius.lg - 4,
    borderTopRightRadius: radius.lg - 4,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  emptySheet: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopLeftRadius: radius.lg - 4,
    borderTopRightRadius: radius.lg - 4,
    backgroundColor: colors.white,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storeImage: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
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
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
  },
  distanceText: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
  },
  reviewText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
  },
  viewStoreButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  viewStoreText: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
  },
});
