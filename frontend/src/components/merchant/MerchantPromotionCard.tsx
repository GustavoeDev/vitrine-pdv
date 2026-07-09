import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/tokens';
import { DEFAULT_PRODUCT_IMAGE } from '@/src/constants/images';
import { MerchantPromotion } from '@/src/types/merchant';
import {
  formatCurrency,
  formatPromotionDateRange,
  getPromotionStatusLabel,
  getPromotionTypeLabel,
} from '@/src/utils/merchantPromotions';

interface MerchantPromotionCardProps {
  promotion: MerchantPromotion;
  isSaving?: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
}

function resolveStatusStyle(status: MerchantPromotion['status']) {
  if (status === 'active') {
    return styles.statusActive;
  }

  if (status === 'scheduled') {
    return styles.statusScheduled;
  }

  return styles.statusEnded;
}

export function MerchantPromotionCard({
  promotion,
  isSaving = false,
  onEdit,
  onToggleStatus,
}: MerchantPromotionCardProps) {
  const imageUrl = promotion.banner_url ?? DEFAULT_PRODUCT_IMAGE;
  const isProductDiscount = promotion.promotion_type === 'product-discount';

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Image source={{ uri: imageUrl }} style={styles.image} />

        <View style={styles.info}>
          <View style={styles.badgesRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{getPromotionTypeLabel(promotion.promotion_type)}</Text>
            </View>
            <View style={[styles.statusBadge, resolveStatusStyle(promotion.status)]}>
              <Text style={styles.statusBadgeText}>{getPromotionStatusLabel(promotion.status)}</Text>
            </View>
          </View>

          <Text numberOfLines={2} style={styles.title}>
            {promotion.title}
          </Text>

          {promotion.description && !isProductDiscount ? (
            <Text numberOfLines={2} style={styles.description}>
              {promotion.description}
            </Text>
          ) : null}

          {isProductDiscount && promotion.original_price != null && promotion.discounted_price != null ? (
            <View style={styles.priceRow}>
              <Text style={styles.oldPrice}>{formatCurrency(promotion.original_price)}</Text>
              <Text style={styles.newPrice}>{formatCurrency(promotion.discounted_price)}</Text>
            </View>
          ) : null}

          <View style={styles.dateRow}>
            <Ionicons color={colors.textSecondary} name="calendar-outline" size={14} />
            <Text style={styles.dateText}>
              {formatPromotionDateRange(promotion.start_date, promotion.end_date)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={onEdit}
          style={[styles.actionButton, styles.editButton]}
        >
          <Ionicons color={colors.primary} name="create-outline" size={16} />
          <Text style={styles.editButtonText}>Editar</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={onToggleStatus}
          style={styles.actionButton}
        >
          <Ionicons
            color={colors.textSecondary}
            name={promotion.status === 'active' ? 'pause-circle-outline' : 'play-circle-outline'}
            size={16}
          />
          <Text style={styles.actionText}>
            {promotion.status === 'active' ? 'Pausar' : 'Reativar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg - 4,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
  },
  typeBadgeText: {
    color: colors.primary,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusScheduled: {
    backgroundColor: '#FEF3C7',
  },
  statusEnded: {
    backgroundColor: colors.neutralSoft,
  },
  statusBadgeText: {
    color: colors.textPrimary,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  oldPrice: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    textDecorationLine: 'line-through',
  },
  newPrice: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editButton: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  actionText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
