import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { Platform } from 'react-native';

import { queryClient } from '@/src/lib/queryClient';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'ios' ? 'ios_from_right' : 'fade_from_bottom',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      />
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}
