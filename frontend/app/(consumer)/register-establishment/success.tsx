import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/src/components/ui/BottomNav';
import { DEFAULT_LOGO_IMAGE } from '@/src/constants/establishment';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useEstablishmentRegistration } from '@/src/contexts/EstablishmentRegistrationContext';
import { getCategoryLabel } from '@/src/utils/establishmentRegistration';

const nextSteps = [
  {
    icon: 'checkmark-circle-outline' as const,
    text: 'Seu cadastro foi recebido com sucesso',
  },
  {
    icon: 'search-outline' as const,
    text: 'Nossa equipe vai revisar as informações',
  },
  {
    icon: 'notifications-outline' as const,
    text: 'Você receberá uma notificação com o resultado',
  },
];

export default function RegisterEstablishmentSuccessScreen() {
  const { data } = useEstablishmentRegistration();
  const categoryLabel = getCategoryLabel(data.categoryId);
  const logoUri = data.logoImageUri ?? DEFAULT_LOGO_IMAGE;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.successIcon}>
              <Ionicons color={colors.primary} name="checkmark" size={56} />
            </View>

            <Text style={styles.title}>Estabelecimento enviado para análise!</Text>
            <Text style={styles.description}>
              Nosso time irá revisar as informações do seu negócio. Você receberá uma
              notificação assim que a análise for concluída.
            </Text>

            <View style={styles.deadlinePill}>
              <Ionicons color={colors.primary} name="time-outline" size={16} />
              <Text style={styles.deadlineText}>Prazo de análise: até 24 horas</Text>
            </View>

            <View style={styles.nextSection}>
              <Text style={styles.nextTitle}>O que acontece agora?</Text>
              {nextSteps.map((step) => (
                <View key={step.text} style={styles.nextItem}>
                  <Ionicons color={colors.primary} name={step.icon} size={16} />
                  <Text style={styles.nextText}>{step.text}</Text>
                </View>
              ))}
            </View>

            <View style={styles.summaryCard}>
              <Image source={{ uri: logoUri }} style={styles.summaryAvatar} />
              <View style={styles.summaryDetails}>
                <Text style={styles.summaryName}>{data.name}</Text>
                <Text style={styles.summarySubtitle}>
                  {categoryLabel} • {data.subcategory}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Em análise</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(consumer)')}
          style={styles.homeButton}
        >
          <Text style={styles.homeButtonText}>Voltar para o Início</Text>
        </Pressable>

        <BottomNav active="profile" isRootScreen={false} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 10,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: spacing.lg,
  },
  content: {
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: 300,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
    textAlign: 'center',
    maxWidth: 300,
  },
  deadlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: 300,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
  },
  deadlineText: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  nextSection: {
    width: '100%',
    gap: 12,
    paddingVertical: spacing.lg,
  },
  nextTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
  nextItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  nextText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  summaryCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  summaryDetails: {
    flex: 1,
    gap: 3,
  },
  summaryName: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
  },
  summarySubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#FEF08A',
  },
  badgeText: {
    color: '#B45309',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
  homeButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  homeButtonText: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
});
