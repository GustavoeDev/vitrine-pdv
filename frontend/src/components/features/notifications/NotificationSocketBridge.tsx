import { useNotificationSocket } from '@/src/hooks/useNotificationSocket';

export function NotificationSocketBridge() {
  useNotificationSocket();
  return null;
}
