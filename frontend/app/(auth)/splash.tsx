import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthLogo } from '@/src/components/ui/AuthLogo';
import { colors, spacing } from '@/src/constants/tokens';

export default function SplashScreen() {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.replace('./login');
    }, 1800);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <AuthLogo inverted variant="stacked" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 70,
  },
});
