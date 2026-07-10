import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { AppState, Platform, StatusBar as RNStatusBar } from 'react-native';

import { colors } from '@/src/constants/tokens';

export async function applyAndroidSystemUiTheme(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  RNStatusBar.setBackgroundColor(colors.primary);
  RNStatusBar.setBarStyle('light-content');

  await SystemUI.setBackgroundColorAsync(colors.black);
  await NavigationBar.setStyle('dark');
  await NavigationBar.setButtonStyleAsync('light');
}

export function subscribeAndroidSystemUiTheme(): () => void {
  if (Platform.OS !== 'android') {
    return () => undefined;
  }

  void applyAndroidSystemUiTheme();

  const subscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      void applyAndroidSystemUiTheme();
    }
  });

  return () => subscription.remove();
}
