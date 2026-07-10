import { DEFAULT_STORE_AVATAR } from '@/src/constants/images';
import type { ApiNotification } from '@/src/services/notifications';
import type { NotificationGroup, NotificationItem } from '@/src/types';

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function resolveGroupTitle(date: Date, today: Date): string {
  const dayStart = startOfDay(date).getTime();
  const todayStart = startOfDay(today).getTime();
  const diffDays = Math.round((todayStart - dayStart) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Hoje';
  }

  if (diffDays === 1) {
    return 'Ontem';
  }

  if (diffDays <= 7) {
    return 'Esta semana';
  }

  return 'Anteriores';
}

export function formatNotificationRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `há ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `há ${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return 'ontem';
  }

  if (diffDays < 7) {
    return `há ${diffDays} dias`;
  }

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function mapApiNotificationToItem(notification: ApiNotification): NotificationItem {
  return {
    id: notification.id,
    storeName: notification.store_name ?? notification.title,
    message: notification.message,
    time: formatNotificationRelativeTime(notification.created_at),
    unread: !notification.is_read,
    avatarUrl: notification.store_logo_url ?? DEFAULT_STORE_AVATAR,
    notificationType: notification.notification_type,
    storeId: notification.store_id,
    promotionId: notification.promotion_id,
    reviewId: notification.review_id,
    reviewRating: notification.review_rating,
  };
}

export function groupNotifications(notifications: ApiNotification[]): NotificationGroup[] {
  const today = new Date();
  const groups = new Map<string, NotificationItem[]>();

  for (const notification of notifications) {
    const title = resolveGroupTitle(new Date(notification.created_at), today);
    const items = groups.get(title) ?? [];
    items.push(mapApiNotificationToItem(notification));
    groups.set(title, items);
  }

  const order = ['Hoje', 'Ontem', 'Esta semana', 'Anteriores'];

  return order
    .filter((title) => groups.has(title))
    .map((title) => ({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      items: groups.get(title) ?? [],
    }));
}
