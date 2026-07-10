import { resolveApiBaseUrl } from '@/src/lib/apiConfig';
import { notificationSchema, type ApiNotification } from '@/src/services/notifications';

const BACKOFF_STEPS_MS = [1_000, 2_000, 5_000, 10_000, 30_000];

export type NotificationSocketMessage = {
  type: 'notification.created';
  notification: ApiNotification;
};

function resolveWebSocketNotificationsUrl(accessToken: string): string {
  const apiBase = resolveApiBaseUrl().replace(/\/$/, '');
  const origin = apiBase.replace(/\/api\/v1$/, '');
  const wsOrigin = origin.replace(/^http/, 'ws');

  return `${wsOrigin}/ws/notifications/?token=${encodeURIComponent(accessToken)}`;
}

type MessageHandler = (message: NotificationSocketMessage) => void;

class NotificationSocketClient {
  private socket: WebSocket | null = null;
  private accessToken: string | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;
  private onMessage: MessageHandler | null = null;

  setMessageHandler(handler: MessageHandler | null) {
    this.onMessage = handler;
  }

  connect(accessToken: string) {
    if (
      this.accessToken === accessToken &&
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.disconnect(false);
    this.accessToken = accessToken;
    this.shouldReconnect = true;
    this.openSocket();
  }

  disconnect(clearToken = true) {
    this.shouldReconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (clearToken) {
      this.accessToken = null;
      this.reconnectAttempt = 0;
    }
  }

  private openSocket() {
    if (!this.accessToken) {
      return;
    }

    const url = resolveWebSocketNotificationsUrl(this.accessToken);
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.onopen = () => {
      this.reconnectAttempt = 0;
    };

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(String(event.data)) as unknown;

        if (
          typeof parsed !== 'object' ||
          parsed === null ||
          (parsed as { type?: string }).type !== 'notification.created' ||
          !(parsed as { notification?: unknown }).notification
        ) {
          return;
        }

        const message: NotificationSocketMessage = {
          type: 'notification.created',
          notification: notificationSchema.parse(
            (parsed as { notification: unknown }).notification,
          ),
        };

        this.onMessage?.(message);
      } catch {
        // Ignore malformed websocket payloads.
      }
    };

    socket.onclose = () => {
      this.socket = null;

      if (!this.shouldReconnect || !this.accessToken) {
        return;
      }

      const delay =
        BACKOFF_STEPS_MS[Math.min(this.reconnectAttempt, BACKOFF_STEPS_MS.length - 1)];
      this.reconnectAttempt += 1;

      this.reconnectTimer = setTimeout(() => {
        this.openSocket();
      }, delay);
    };

    socket.onerror = () => {
      socket.close();
    };
  }
}

export const notificationSocketClient = new NotificationSocketClient();

export function connectNotificationSocket(accessToken: string) {
  notificationSocketClient.connect(accessToken);
}

export function disconnectNotificationSocket() {
  notificationSocketClient.disconnect();
}
