import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { AppModalProvider } from '@/src/contexts/AppModalContext';
import { NotificationSocketBridge } from '@/src/components/features/notifications/NotificationSocketBridge';
import { colors } from '@/src/constants/tokens';
import { useAndroidSystemUiTheme } from '@/src/hooks/useAndroidSystemUiTheme';
import { queryClient } from '@/src/lib/queryClient';
import { useAuthStore } from '@/src/stores/authStore';

export default function RootLayout() {
  useAndroidSystemUiTheme();
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationSocketBridge />
      <AppModalProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: Platform.OS === 'ios' ? 'ios_from_right' : 'fade_from_bottom',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
        <StatusBar style="light" backgroundColor={colors.primary} translucent={false} />
      </AppModalProvider>
    </QueryClientProvider>
  );
}
