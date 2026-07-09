import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from '@/src/components/ui/AuthButton';
import { AuthDivider } from '@/src/components/ui/AuthDivider';
import { AuthLogo } from '@/src/components/ui/AuthLogo';
import { AuthTextInput } from '@/src/components/ui/AuthTextInput';
import { AvatarPicker } from '@/src/components/ui/AvatarPicker';
import { colors, spacing, typography } from '@/src/constants/tokens';

export default function RegisterScreen() {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <AuthLogo />
          </View>

          <View style={styles.form}>
            <AvatarPicker
              imageUri={avatarUri}
              initial="M"
              onImageSelected={setAvatarUri}
            />
            <AuthTextInput
              autoComplete="name"
              label="Nome completo"
              placeholder="Digite seu nome"
              textContentType="name"
            />
            <AuthTextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Email"
              placeholder="seu@email.com"
              textContentType="emailAddress"
            />
            <AuthTextInput
              autoComplete="new-password"
              isPassword
              label="Senha"
              placeholder="Digite sua senha"
              textContentType="newPassword"
            />
            <AuthTextInput
              autoComplete="new-password"
              isPassword
              label="Confirme sua senha"
              placeholder="Digite sua senha novamente"
              textContentType="newPassword"
            />
            <AuthButton label="Criar conta" />
            <AuthDivider />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('./login')}
            style={styles.loginFooter}
          >
            <Text style={styles.loginText}>Já tem conta? Faça login</Text>
          </Pressable>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginTop: 29,
    marginBottom: 28,
  },
  form: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  loginFooter: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  loginText: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
