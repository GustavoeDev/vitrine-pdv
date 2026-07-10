import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/src/constants/tokens';
import type { NotificationAudience } from '@/src/services/notifications';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useRefreshNotifications,
} from '@/src/queries/useNotifications';
import type { NotificationItem } from '@/src/types';
import { groupNotifications } from '@/src/utils/notificationGroups';

interface NotificationsScreenContentProps {
  audience: NotificationAudience;
  bottomNav: ReactNode;
  emptyMessage: string;
  onBack: () => void;
  onNotificationPress: (notification: NotificationItem) => void;
}

function NotificationListItem({
  notification,
  onPress,
}: {
  notification: NotificationItem;
  onPress: () => void;
}) {
  const iconName =
    notification.notificationType === 'store_review' ? 'star' : 'megaphone-outline';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.item, notification.unread ? styles.itemUnread : styles.itemRead]}
    >
      <View style={styles.avatarWrap}>
        <Image source={{ uri: notification.avatarUrl }} style={styles.avatar} />
        <View style={styles.typeBadge}>
          <Ionicons color={colors.white} name={iconName} size={12} />
        </View>
      </View>

      <View style={styles.itemBody}>
        <View style={styles.itemHeader}>
          <Text numberOfLines={1} style={styles.itemTitle}>
            {notification.storeName}
          </Text>
          <Text style={styles.itemTime}>{notification.time}</Text>
        </View>
        <Text numberOfLines={2} style={styles.itemMessage}>
          {notification.message}
        </Text>
      </View>

      {notification.unread ? <View style={styles.unreadDot} /> : null}
    </Pressable>
  );
}

export function NotificationsScreenContent({
  audience,
  bottomNav,
  emptyMessage,
  onBack,
  onNotificationPress,
}: NotificationsScreenContentProps) {
  const { data: notifications = [], isLoading, isError, refetch, isRefetching } =
    useNotifications(audience);
  const refreshNotifications = useRefreshNotifications(audience);
  const markRead = useMarkNotificationRead(audience);
  const markAllRead = useMarkAllNotificationsRead(audience);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refreshNotifications();
    }, [refreshNotifications]),
  );

  const groups = useMemo(() => groupNotifications(notifications), [notifications]);
  const hasUnread = notifications.some((notification) => !notification.is_read);

  const handlePress = async (notification: NotificationItem) => {
    if (notification.unread) {
      await markRead.mutateAsync(notification.id);
    }

    onNotificationPress(notification);
  };

  const handleMarkAllRead = async () => {
    if (!hasUnread || markAllRead.isPending) {
      return;
    }

    await markAllRead.mutateAsync();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([refetch(), refreshNotifications()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Pressable
              accessibilityLabel="Voltar"
              accessibilityRole="button"
              onPress={onBack}
              style={styles.backButton}
            >
              <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
            </Pressable>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>Notificações</Text>
              <Text style={styles.subtitle}>
                {audience === 'consumer' ? 'Ofertas e novidades' : 'Avaliações da sua loja'}
              </Text>
            </View>
          </View>

          {hasUnread ? (
            <Pressable
              accessibilityRole="button"
              disabled={markAllRead.isPending}
              hitSlop={8}
              onPress={() => void handleMarkAllRead()}
            >
              <Text style={styles.markAllText}>Marcar todas como lidas</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              colors={[colors.primary]}
              onRefresh={() => void handleRefresh()}
              refreshing={isRefreshing || isRefetching}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : isError ? (
            <View style={styles.emptyState}>
              <Ionicons color={colors.textMuted} name="alert-circle-outline" size={40} />
              <Text style={styles.emptyTitle}>Não foi possível carregar</Text>
              <Text style={styles.emptyText}>Tente novamente em instantes.</Text>
            </View>
          ) : groups.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons color={colors.primary} name="notifications-off-outline" size={28} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
          ) : (
            groups.map((group) => (
              <View key={group.id} style={styles.group}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <View style={styles.groupList}>
                  {group.items.map((notification) => (
                    <NotificationListItem
                      key={notification.id}
                      notification={notification}
                      onPress={() => void handlePress(notification)}
                    />
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {bottomNav}
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
    gap: spacing.md,
  },
  header: {
    gap: spacing.sm,
    paddingTop: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralSoft,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
  markAllText: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    alignSelf: 'flex-start',
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  centered: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  groupList: {
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg - 4,
    borderWidth: 1,
  },
  itemUnread: {
    backgroundColor: colors.primarySoft,
    borderColor: '#FED7AA',
  },
  itemRead: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
  },
  typeBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
  },
  itemBody: {
    flex: 1,
    gap: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  itemTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  itemTime: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  itemMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
  unreadDot: {
    width: 8,
    height: 8,
    marginTop: 6,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
    textAlign: 'center',
  },
});
