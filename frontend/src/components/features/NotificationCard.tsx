import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/tokens';
import { NotificationItem } from '@/src/types';

interface NotificationCardProps {
  notification: NotificationItem;
}

export function NotificationCard({ notification }: NotificationCardProps) {
  return (
    <View style={[styles.card, notification.unread ? styles.unreadCard : styles.readCard]}>
      {notification.unread ? <View style={styles.unreadDot} /> : null}
      <Image source={{ uri: notification.avatarUrl }} style={styles.avatar} />
      <View style={styles.content}>
        <Text style={styles.title}>{notification.storeName}</Text>
        <Text style={styles.message}>{notification.message}</Text>
      </View>
      <Text style={styles.time}>{notification.time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
    borderRadius: radius.sm,
  },
  unreadCard: {
    backgroundColor: colors.primarySoft,
  },
  readCard: {
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    backgroundColor: colors.primary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutralSoft,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  message: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
  },
  time: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
});
