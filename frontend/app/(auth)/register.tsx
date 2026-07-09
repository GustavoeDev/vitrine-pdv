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
import { useAuthStore } from '@/src/stores/authStore';
import { getApiErrorMessage } from '@/src/utils/apiError';

export default function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password || !passwordConfirm) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setError(null);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirm: passwordConfirm,
        avatarUri,
      });
      router.replace('/(consumer)' as never);
    } catch (registerError) {
      setError(getApiErrorMessage(registerError, 'Não foi possível criar a conta.'));
    }
  }

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
              onChangeText={setName}
              placeholder="Digite seu nome"
              textContentType="name"
              value={name}
            />
            <AuthTextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="seu@email.com"
              textContentType="emailAddress"
              value={email}
            />
            <AuthTextInput
              autoComplete="new-password"
              isPassword
              label="Senha"
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              textContentType="newPassword"
              value={password}
            />
            <AuthTextInput
              autoComplete="new-password"
              isPassword
              label="Confirme sua senha"
              onChangeText={setPasswordConfirm}
              placeholder="Digite sua senha novamente"
              textContentType="newPassword"
              value={passwordConfirm}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <AuthButton
              disabled={isAuthenticating}
              label={isAuthenticating ? 'Criando conta...' : 'Criar conta'}
              onPress={handleRegister}
            />
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
  errorText: {
    ...typography.body,
    color: colors.danger,
    width: '100%',
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
