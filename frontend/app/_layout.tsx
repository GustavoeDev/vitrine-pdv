import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { AppModalProvider } from '@/src/contexts/AppModalContext';
import { colors } from '@/src/constants/tokens';
import { useAndroidSystemUiTheme } from '@/src/hooks/useAndroidSystemUiTheme';
import { queryClient } from '@/src/lib/queryClient';

export default function RootLayout() {
  useAndroidSystemUiTheme();

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
