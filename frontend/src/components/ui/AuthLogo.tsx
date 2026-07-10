import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/src/constants/tokens';

const whiteLogo = require('@/src/assets/logo_vitrinepdv_white.png');
const orangeLogo = require('@/src/assets/logo_vitrinepdv_orange.png');

interface AuthLogoProps {
  variant?: 'horizontal' | 'stacked';
  inverted?: boolean;
}

export function AuthLogo({ variant = 'horizontal', inverted = false }: AuthLogoProps) {
  const textColor = inverted ? colors.white : colors.textPrimary;
  const isStacked = variant === 'stacked';
  const logoSource = inverted ? whiteLogo : orangeLogo;

  return (
    <View style={[styles.container, isStacked ? styles.stacked : styles.horizontal]}>
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={logoSource}
        style={isStacked ? styles.splashLogo : styles.logo}
      />
      <Text style={[isStacked ? styles.splashTitle : styles.title, { color: textColor }]}>
        VitrinePDV
      </Text>
      {isStacked ? (
        <Text style={styles.subtitle}>O comércio local na palma da sua mão</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stacked: {
    gap: 10,
  },
  logo: {
    width: 28,
    height: 31,
  },
  splashLogo: {
    width: 55,
    height: 63,
  },
  title: {
    ...typography.logo,
  },
  splashTitle: {
    ...typography.splashTitle,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 247, 237, 0.85)',
    textAlign: 'center',
  },
});
