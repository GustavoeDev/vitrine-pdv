import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { AppState, Platform, StatusBar as RNStatusBar } from 'react-native';

import { colors } from '@/src/constants/tokens';

/**
 * Aplica cores da status bar / navigation bar no Android.
 * Só funciona de forma confiável com `android.edgeToEdgeEnabled: false`
 * (APIs de cor de fundo foram deprecadas no edge-to-edge / Android 15+).
 */
export async function applyAndroidSystemUiTheme(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  RNStatusBar.setBackgroundColor(colors.primary, false);
  RNStatusBar.setBarStyle('light-content');
  RNStatusBar.setTranslucent(false);

  await SystemUI.setBackgroundColorAsync(colors.black);

  try {
    await NavigationBar.setBackgroundColorAsync(colors.black);
    await NavigationBar.setButtonStyleAsync('light');
  } catch {
    // Sem efeito se edge-to-edge estiver ligado no device.
  }
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
