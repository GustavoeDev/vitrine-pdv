import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function ConsumerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'ios_from_right' : 'fade_from_bottom',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    />
  );
}
