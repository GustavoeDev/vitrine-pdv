import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { MerchantProvider } from '@/src/contexts/MerchantContext';

export default function MerchantLayout() {
  return (
    <MerchantProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'ios' ? 'ios_from_right' : 'fade_from_bottom',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      />
    </MerchantProvider>
  );
}
