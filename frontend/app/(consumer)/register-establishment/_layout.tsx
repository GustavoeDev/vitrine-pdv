import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { EstablishmentRegistrationProvider } from '@/src/contexts/EstablishmentRegistrationContext';

export default function RegisterEstablishmentLayout() {
  return (
    <EstablishmentRegistrationProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'ios' ? 'ios_from_right' : 'fade_from_bottom',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="success" options={{ animation: 'fade_from_bottom' }} />
      </Stack>
    </EstablishmentRegistrationProvider>
  );
}
