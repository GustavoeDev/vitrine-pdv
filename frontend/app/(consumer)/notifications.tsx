import { router } from 'expo-router';

import { NotificationsScreenContent } from '@/src/components/features/notifications/NotificationsScreenContent';
import { BottomNav } from '@/src/components/ui/BottomNav';
import type { NotificationItem } from '@/src/types';

export default function ConsumerNotificationsScreen() {
  const handleNotificationPress = (notification: NotificationItem) => {
    if (notification.promotionId) {
      router.push(`/(consumer)/promotions/${notification.promotionId}?origin=home` as never);
      return;
    }

    if (notification.storeId) {
      router.push(`/(consumer)/stores/${notification.storeId}?origin=home` as never);
    }
  };

  return (
    <NotificationsScreenContent
      audience="consumer"
      bottomNav={<BottomNav active="home" isRootScreen={false} />}
      emptyMessage="Quando uma loja favorita lançar promoção do dia, ela aparecerá aqui."
      onBack={() => router.back()}
      onNotificationPress={handleNotificationPress}
    />
  );
}
