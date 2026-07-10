import { router } from 'expo-router';

import { NotificationsScreenContent } from '@/src/components/features/notifications/NotificationsScreenContent';
import { MerchantBottomNav } from '@/src/components/merchant/MerchantBottomNav';
import type { NotificationItem } from '@/src/types';

export default function MerchantNotificationsScreen() {
  const handleNotificationPress = (notification: NotificationItem) => {
    if (notification.storeId) {
      router.push('/(merchant)/reviews' as never);
      return;
    }

    router.push('/(merchant)/reviews' as never);
  };

  return (
    <NotificationsScreenContent
      audience="merchant"
      bottomNav={<MerchantBottomNav active="dashboard" />}
      emptyMessage="Quando alguém avaliar sua loja, a notificação aparecerá aqui."
      onBack={() => router.back()}
      onNotificationPress={handleNotificationPress}
    />
  );
}
