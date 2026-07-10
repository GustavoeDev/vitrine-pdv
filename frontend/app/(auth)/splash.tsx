import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthLogo } from '@/src/components/ui/AuthLogo';
import { colors, spacing } from '@/src/constants/tokens';
import { useAuthStore } from '@/src/stores/authStore';

export default function SplashScreen() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setMinSplashElapsed(true);
    }, 1800);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isHydrated || !minSplashElapsed) {
      return;
    }

    if (accessToken) {
      if (user?.is_staff) {
        router.replace('/(admin)' as never);
        return;
      }

      router.replace('/(consumer)' as never);
      return;
    }

    router.replace('./login');
  }, [accessToken, isHydrated, minSplashElapsed, user]);

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
