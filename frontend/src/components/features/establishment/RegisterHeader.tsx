import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StepIndicator } from '@/src/components/features/establishment/StepIndicator';
import { colors, spacing } from '@/src/constants/tokens';

interface RegisterStepBarProps {
  title: string;
  currentStep: number;
  showBackLink?: boolean;
  showSkipLink?: boolean;
  onBack?: () => void;
  onSkip?: () => void;
}

export function RegisterStepBar({
  title,
  currentStep,
  showBackLink = false,
  showSkipLink = false,
  onBack,
  onSkip,
}: RegisterStepBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.actions}>
        {showBackLink ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onBack}>
            <Text style={styles.link}>Voltar</Text>
          </Pressable>
        ) : null}
        <StepIndicator currentStep={currentStep} />
        {showSkipLink ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onSkip}>
            <Text style={styles.link}>Pular</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

interface RegisterHeaderProps {
  onBack?: () => void;
}

export function RegisterHeader({ onBack }: RegisterHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Voltar"
        accessibilityRole="button"
        onPress={onBack ?? (() => router.back())}
        style={styles.backButton}
      >
        <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
      </Pressable>
      <Text style={styles.headerTitle}>Registrar Estabelecimento</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralSoft,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  link: {
    color: colors.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
