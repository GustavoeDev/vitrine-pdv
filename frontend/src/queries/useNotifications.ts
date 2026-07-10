import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchNotifications,
  fetchUnreadNotificationsCount,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationAudience,
} from '@/src/services/notifications';
import { useAuthStore } from '@/src/stores/authStore';

export const notificationKeys = {
  list: (audience: NotificationAudience) => ['notifications', 'list', audience] as const,
  unreadCount: (audience: NotificationAudience) =>
    ['notifications', 'unread-count', audience] as const,
};

export function useNotifications(audience: NotificationAudience) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: notificationKeys.list(audience),
    queryFn: () => fetchNotifications(audience),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
    refetchOnMount: 'always',
  });
}

export function useUnreadNotificationsCount(audience: NotificationAudience) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: notificationKeys.unreadCount(audience),
    queryFn: () => fetchUnreadNotificationsCount(audience),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}

export function useMarkNotificationRead(audience: NotificationAudience) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationKeys.list(audience) }),
        queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(audience) }),
      ]);
    },
  });
}

export function useMarkAllNotificationsRead(audience: NotificationAudience) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(audience),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationKeys.list(audience) }),
        queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(audience) }),
      ]);
    },
  });
}

export function useRefreshNotifications(audience: NotificationAudience) {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: notificationKeys.list(audience) }),
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(audience) }),
    ]);
  };
}
