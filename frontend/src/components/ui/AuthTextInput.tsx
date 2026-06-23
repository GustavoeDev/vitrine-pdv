import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, typography } from '@/src/constants/tokens';

interface AuthTextInputProps extends TextInputProps {
  label: string;
  isPassword?: boolean;
}

export function AuthTextInput({
  label,
  isPassword = false,
  secureTextEntry,
  ...inputProps
}: AuthTextInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const shouldHideText = isPassword && !isVisible;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          {...inputProps}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry ?? shouldHideText}
          style={styles.input}
        />
        {isPassword ? (
          <Pressable
            accessibilityLabel={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setIsVisible((current) => !current)}
            style={styles.passwordToggle}
          >
            <Ionicons
              name={isVisible ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: '100%',
    gap: 6,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  inputWrap: {
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
    padding: 0,
  },
  passwordToggle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
