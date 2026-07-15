import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { DEFAULT_LOGO_IMAGE } from '@/src/constants/establishment';
import { colors, radius } from '@/src/constants/tokens';
import type { AdminStoreListItem } from '@/src/types/store';
import {
  formatRegisteredAt,
  formatStoreCategoryLine,
  getStoreInitial,
} from '@/src/utils/storePresentation';

interface AdminStoreCardProps {
  store: AdminStoreListItem;
  onApprove?: () => void;
  onReject?: () => void;
  onDeactivate?: () => void;
  onActivate?: () => void;
  onDetails: () => void;
  isProcessing?: boolean;
}

export function AdminStoreCard({
  store,
  onApprove,
  onReject,
  onDeactivate,
  onActivate,
  onDetails,
  isProcessing = false,
}: AdminStoreCardProps) {
  const logoUri = store.logo_url ?? DEFAULT_LOGO_IMAGE;
  const showReviewActions = store.status === 'PENDING' && onApprove && onReject;
  const showDeactivate = store.status === 'ACTIVE' && onDeactivate;
  const showActivate = store.status === 'INACTIVE' && onActivate;

  return (
    <View style={styles.card}>
      <View style={styles.infoSection}>
        {store.logo_url ? (
          <Image source={{ uri: logoUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{getStoreInitial(store.name)}</Text>
          </View>
        )}

        <View style={styles.details}>
          <Text style={styles.name}>{store.name}</Text>
          <Text style={styles.category}>
            {formatStoreCategoryLine(store.category_name, store.subcategory)}
          </Text>
          <Text style={styles.address}>📍 {store.address_summary}</Text>
          <Text style={styles.registeredAt}>{formatRegisteredAt(store.created_at)}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={isProcessing}
            onPress={onDetails}
            style={styles.detailsButton}
          >
            <Text style={styles.detailsText}>Detalhes</Text>
          </Pressable>

          {showReviewActions ? (
            <>
              <Pressable
                accessibilityRole="button"
                disabled={isProcessing}
                onPress={onApprove}
                style={styles.approveButton}
              >
                <Text style={styles.approveText}>Aprovar</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isProcessing}
                onPress={onReject}
                style={styles.rejectButton}
              >
                <Text style={styles.rejectText}>Recusar</Text>
              </Pressable>
            </>
          ) : null}

          {showDeactivate ? (
            <Pressable
              accessibilityRole="button"
              disabled={isProcessing}
              onPress={onDeactivate}
              style={styles.deactivateButton}
            >
              <Text style={styles.deactivateText}>Desativar</Text>
            </Pressable>
          ) : null}

          {showActivate ? (
            <Pressable
              accessibilityRole="button"
              disabled={isProcessing}
              onPress={onActivate}
              style={styles.approveButton}
            >
              <Text style={styles.approveText}>Ativar</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  infoSection: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  avatarInitial: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  details: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  category: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  address: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  registeredAt: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
  actionsRow: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButton: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: colors.background,
  },
  detailsText: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  approveButton: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  approveText: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  rejectButton: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.background,
  },
  rejectText: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  deactivateButton: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D97706',
    backgroundColor: colors.background,
  },
  deactivateText: {
    color: '#D97706',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
