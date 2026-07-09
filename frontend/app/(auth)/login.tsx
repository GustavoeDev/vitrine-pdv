import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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

export default function LoginScreen() {
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
            placeholder="seu@email.com"
            textContentType="emailAddress"
          />
          <AuthTextInput
            autoComplete="password"
            isPassword
            label="Senha"
            placeholder="Digite sua senha"
            textContentType="password"
          />
          <AuthButton label="Entrar" onPress={() => router.replace('/(consumer)' as never)} />
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
  forgotButton: {
    alignSelf: 'flex-start',
  },
  forgotText: {
    ...typography.body,
    color: colors.primary,
  },
});
