import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import { RegisterScreenLayout } from '@/src/components/features/establishment/RegisterScreenLayout';
import { RegisterStepBar } from '@/src/components/features/establishment/RegisterHeader';
import { AuthButton } from '@/src/components/ui/AuthButton';
import {
  DEFAULT_COVER_IMAGE,
  DEFAULT_LOGO_IMAGE,
} from '@/src/constants/establishment';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useEstablishmentRegistration } from '@/src/contexts/EstablishmentRegistrationContext';
import { useCategories } from '@/src/queries/useCategories';
import { useAuthStore } from '@/src/stores/authStore';
import {
  formatAddress,
  formatPhone,
  formatScheduleSummary,
  getCategoryLabel,
  getFirstIncompleteStep,
} from '@/src/utils/establishmentRegistration';
import { getApiErrorMessage } from '@/src/utils/apiError';
import { getRegistrationStepRoute } from '@/src/utils/registrationNavigation';

export default function RegisterEstablishmentStep4Screen() {
  const { data, allStepsComplete, submitRegistration, isSubmitting } =
    useEstablishmentRegistration();
  const { data: categories = [] } = useCategories();
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!allStepsComplete) {
      const incompleteStep = getFirstIncompleteStep(data, categories);

      if (incompleteStep) {
        router.replace(getRegistrationStepRoute(incompleteStep) as never);
      }
    }
  }, [allStepsComplete, categories, data]);

  const coverUri = data.coverImageUri ?? DEFAULT_COVER_IMAGE;
  const logoUri = data.logoImageUri ?? DEFAULT_LOGO_IMAGE;
  const categoryLabel = getCategoryLabel(data.categoryId, categories);

  const handleSubmit = async () => {
    setSubmitError(null);

    try {
      await submitRegistration();
      await refreshUser();
      router.replace('/(consumer)/register-establishment/success');
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Não foi possível enviar o cadastro. Tente novamente.',
      );
      setSubmitError(message);
      Alert.alert('Erro ao cadastrar', message);
    }
  };

  if (!allStepsComplete) {
    return null;
  }

  return (
    <RegisterScreenLayout
      stepBar={
        <RegisterStepBar
          currentStep={4}
          onBack={() => router.back()}
          showBackLink
          title="Confira antes de publicar"
        />
      }
    >
      <View style={styles.reviewCard}>
        <View style={styles.mediaSection}>
          <Image source={{ uri: coverUri }} style={styles.coverImage} />
          <View style={styles.identityRow}>
            <Image source={{ uri: logoUri }} style={styles.logoImage} />
            <View style={styles.identityText}>
              <Text style={styles.storeName}>{data.name}</Text>
              <Text style={styles.storeSubtitle}>
                {categoryLabel}
                {data.subcategory ? ` • ${data.subcategory}` : ''}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsSection}>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Endereço</Text>
            <Text style={styles.detailValue}>{formatAddress(data)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Telefone</Text>
            <Text style={styles.detailValue}>{formatPhone(data.phone)}</Text>
          </View>

          <View style={styles.hoursRow}>
            <Text style={styles.detailLabel}>Horário</Text>
            <Text style={styles.hoursValue}>{formatScheduleSummary(data.schedule)}</Text>
          </View>
        </View>
      </View>

      {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

      <AuthButton
        disabled={isSubmitting}
        label={isSubmitting ? 'Enviando...' : 'Concluir cadastro'}
        onPress={handleSubmit}
      />
    </RegisterScreenLayout>
  );
}

const styles = StyleSheet.create({
  reviewCard: {
    borderRadius: radius.lg - 4,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  mediaSection: {
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  coverImage: {
    width: '100%',
    height: 110,
    borderRadius: radius.lg,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 18,
  },
  identityText: {
    flex: 1,
    gap: 4,
  },
  storeName: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  storeSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  detailsSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  detailBlock: {
    gap: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  hoursValue: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
