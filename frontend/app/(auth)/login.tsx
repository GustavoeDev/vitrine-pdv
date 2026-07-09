import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from '@/src/components/ui/AuthButton';
import { AuthDivider } from '@/src/components/ui/AuthDivider';
import { AuthLogo } from '@/src/components/ui/AuthLogo';
import { AuthTextInput } from '@/src/components/ui/AuthTextInput';
import { colors, spacing, typography } from '@/src/constants/tokens';
import { useAuthStore } from '@/src/stores/authStore';
import { getApiErrorMessage } from '@/src/utils/apiError';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Informe email e senha.');
      return;
    }

    setError(null);

    try {
      await login({ email: email.trim(), password });
      const user = useAuthStore.getState().user;
      router.replace((user?.is_staff ? '/(admin)' : '/(consumer)') as never);
    } catch (loginError) {
      setError(getApiErrorMessage(loginError, 'Não foi possível entrar. Verifique seus dados.'));
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <AuthLogo />
        </View>

        <View style={styles.form}>
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
            autoComplete="password"
            isPassword
            label="Senha"
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            textContentType="password"
            value={password}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <AuthButton
            disabled={isAuthenticating}
            label={isAuthenticating ? 'Entrando...' : 'Entrar'}
            onPress={handleLogin}
          />
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => undefined}
            style={styles.forgotButton}
          >
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </Pressable>
          <AuthDivider />
          <AuthButton
            disabled={isAuthenticating}
            label="Criar conta grátis"
            onPress={() => router.push('./register')}
            variant="outline"
          />
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
    paddingHorizontal: spacing.lg,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginTop: 29,
    marginBottom: 30,
  },
  form: {
    width: '100%',
    gap: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
  },
  forgotButton: {
    alignSelf: 'flex-start',
  },
  forgotText: {
    ...typography.body,
    color: colors.primary,
  },
});
