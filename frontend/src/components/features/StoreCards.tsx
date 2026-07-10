import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/tokens';
import { Store } from '@/src/types';

interface NearbyStoreCardProps {
  store: Store;
  onPress?: () => void;
}

interface FeaturedStoreCardProps {
  store: Store;
  onPress?: () => void;
}

interface FavoriteStoreCardProps {
  store: Store;
  hasActivePromotion?: boolean;
  notificationsEnabled?: boolean;
  onPress?: () => void;
  onToggleNotifications?: () => void;
}

export function NearbyStoreCard({ onPress, store }: NearbyStoreCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.nearbyCard}>
      <Image source={{ uri: store.coverImageUrl }} style={styles.nearbyImage} />
      <Text style={styles.storeName}>{store.name}</Text>
      <Text style={styles.metaText}>
        {store.category} • {store.distance} • {store.rating.toFixed(1)} ★ • {store.reviews} avaliações
      </Text>
    </Pressable>
  );
}

export function FeaturedStoreCard({ onPress, store }: FeaturedStoreCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.featuredCard}>
      <Image source={{ uri: store.avatarUrl }} style={styles.featuredImage} />
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredName}>{store.name}</Text>
        <Text style={styles.featuredSubtitle}>
          {store.category === 'Alimentação' ? 'Mercado' : 'Moda'} • {store.subcategory}
        </Text>
        <View style={styles.featuredMeta}>
          <Text style={styles.rating}>★ {store.rating.toFixed(1)}</Text>
          <Text style={styles.featuredDistance}>{store.distance}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function FavoriteStoreCard({
  store,
  hasActivePromotion = false,
  notificationsEnabled = true,
  onPress,
  onToggleNotifications,
}: FavoriteStoreCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.favoriteCard}>
      <Image source={{ uri: store.coverImageUrl }} style={styles.favoriteImage} />
      <View style={styles.favoriteInfo}>
        <View style={styles.favoriteTopRow}>
          <View style={styles.favoriteText}>
            <Text style={styles.featuredName}>{store.name}</Text>
            <Text style={styles.featuredSubtitle}>
              {store.category} • {store.subcategory}
            </Text>
          </View>
          <View style={styles.favoriteActions}>
            <Pressable
              accessibilityLabel={
                notificationsEnabled
                  ? 'Desativar notificações desta loja'
                  : 'Ativar notificações desta loja'
              }
              accessibilityRole="button"
              hitSlop={8}
              onPress={(event) => {
                event.stopPropagation();
                onToggleNotifications?.();
              }}
              style={styles.favoriteIconWrap}
            >
              <Ionicons
                color={notificationsEnabled ? colors.primary : colors.textMuted}
                name={notificationsEnabled ? 'notifications' : 'notifications-off-outline'}
                size={16}
              />
            </Pressable>
            <View style={styles.favoriteIconWrap}>
              <Ionicons color={colors.primary} name="heart" size={16} />
            </View>
          </View>
        </View>
        <View style={styles.featuredMeta}>
          <Text style={styles.featuredDistance}>{store.distance}</Text>
          <Text style={styles.rating}>★ {store.rating.toFixed(1)}</Text>
        </View>
        {hasActivePromotion ? (
          <View style={styles.promoBadge}>
            <Text style={styles.promoBadgeText}>Promoção ativa</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nearbyCard: {
    width: '100%',
    gap: 4,
    paddingHorizontal: 6,
    paddingBottom: 10,
    borderRadius: radius.lg - 4,
    backgroundColor: colors.background,
  },
  nearbyImage: {
    width: '100%',
    height: 74,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
  },
  storeName: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
  featuredCard: {
    width: '100%',
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: spacing.sm,
    borderRadius: radius.lg - 4,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  featuredImage: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
  },
  featuredInfo: {
    flex: 1,
    gap: 3,
  },
  featuredName: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  featuredSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rating: {
    color: colors.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  featuredDistance: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  favoriteCard: {
    width: '100%',
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: spacing.sm,
    borderRadius: radius.lg - 4,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  favoriteImage: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
  },
  favoriteInfo: {
    flex: 1,
    gap: 4,
  },
  favoriteTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  favoriteText: {
    flex: 1,
    gap: 2,
  },
  favoriteActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  favoriteIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  promoBadge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  promoBadgeText: {
    color: colors.white,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
});
