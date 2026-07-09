import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RegisterHeader } from '@/src/components/features/establishment/RegisterHeader';
import { BottomNav } from '@/src/components/ui/BottomNav';
import { colors, spacing } from '@/src/constants/tokens';

interface RegisterScreenLayoutProps {
  children: React.ReactNode;
  stepBar?: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
  scrollable?: boolean;
}

export function RegisterScreenLayout({
  children,
  stepBar,
  footer,
  onBack,
  scrollable = true,
}: RegisterScreenLayoutProps) {
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
      {footer}
    </ScrollView>
  ) : (
    <View style={styles.staticContent}>
      {children}
      {footer}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.screen}>
          <View style={styles.topSection}>
            <RegisterHeader onBack={onBack} />
            {stepBar}
          </View>
          {content}
          <BottomNav active="profile" isRootScreen={false} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 10,
  },
  topSection: {
    paddingTop: 24,
    gap: spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  staticContent: {
    flex: 1,
    gap: spacing.md,
  },
});
