import { z } from 'zod';

import { api } from './api';

export const notificationAudienceSchema = z.enum(['consumer', 'merchant']);

export const notificationSchema = z.object({
  id: z.string().uuid(),
  audience: notificationAudienceSchema,
  notification_type: z.enum(['daily_promotion', 'store_review']),
  title: z.string(),
  message: z.string(),
  is_read: z.boolean(),
  created_at: z.string(),
  store_id: z.string().uuid().nullable(),
  store_name: z.string().nullable(),
  store_logo_url: z.string().nullable(),
  promotion_id: z.string().uuid().nullable(),
  review_id: z.string().uuid().nullable(),
  review_rating: z.number().nullable(),
});

export type ApiNotification = z.infer<typeof notificationSchema>;
export type NotificationAudience = z.infer<typeof notificationAudienceSchema>;

export async function fetchNotifications(
  audience: NotificationAudience,
): Promise<ApiNotification[]> {
  const { data } = await api.get('/notifications/', { params: { audience } });
  return z.array(notificationSchema).parse(data);
}

export async function fetchUnreadNotificationsCount(
  audience: NotificationAudience,
): Promise<number> {
  const { data } = await api.get('/notifications/unread-count/', { params: { audience } });
  return z.object({ count: z.number() }).parse(data).count;
}

export async function markNotificationRead(notificationId: string): Promise<ApiNotification> {
  const { data } = await api.patch(`/notifications/${notificationId}/read/`);
  return notificationSchema.parse(data);
}

export async function markAllNotificationsRead(audience: NotificationAudience): Promise<number> {
  const { data } = await api.post('/notifications/mark-all-read/', { audience });
  return z.object({ updated: z.number() }).parse(data).updated;
}
