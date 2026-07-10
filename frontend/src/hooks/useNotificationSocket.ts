import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import {
  connectNotificationSocket,
  disconnectNotificationSocket,
  notificationSocketClient,
  type NotificationSocketMessage,
} from '@/src/lib/notificationSocket';
import { getAccessToken } from '@/src/lib/tokenStorage';
import { notificationKeys } from '@/src/queries/useNotifications';
import type { ApiNotification } from '@/src/services/notifications';
import { useAuthStore } from '@/src/stores/authStore';

function applyNotificationToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  notification: ApiNotification,
) {
  const audience = notification.audience;

  queryClient.setQueryData<ApiNotification[]>(
    notificationKeys.list(audience),
    (current = []) => {
      if (current.some((item) => item.id === notification.id)) {
        return current;
      }

      return [notification, ...current];
    },
  );

  if (!notification.is_read) {
    queryClient.setQueryData<number>(notificationKeys.unreadCount(audience), (current = 0) => current + 1);
  }
}

export function useNotificationSocket() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const handleMessage = (message: NotificationSocketMessage) => {
      applyNotificationToCache(queryClient, message.notification);
    };

    notificationSocketClient.setMessageHandler(handleMessage);

    return () => {
      notificationSocketClient.setMessageHandler(null);
    };
  }, [queryClient]);

  useEffect(() => {
    let cancelled = false;

    async function syncConnection() {
      const token = accessToken ?? (await getAccessToken());
      if (cancelled) {
        return;
      }

      if (!token) {
        disconnectNotificationSocket();
        return;
      }

      connectNotificationSocket(token);
    }

    void syncConnection();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active' || !accessToken) {
        return;
      }

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationKeys.list('consumer') }),
        queryClient.invalidateQueries({ queryKey: notificationKeys.list('merchant') }),
        queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount('consumer') }),
        queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount('merchant') }),
      ]);
    });

    return () => {
      subscription.remove();
    };
  }, [accessToken, queryClient]);
}
