import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { AppModalProvider } from '@/src/contexts/AppModalContext';
import { colors } from '@/src/constants/tokens';
import { queryClient } from '@/src/lib/queryClient';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    void (async () => {
      await SystemUI.setBackgroundColorAsync(colors.black);
      await NavigationBar.setButtonStyleAsync('light');
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
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
