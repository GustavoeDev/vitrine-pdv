import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { BusinessHoursDayCard } from '@/src/components/features/establishment/BusinessHoursDayCard';
import { RegisterScreenLayout } from '@/src/components/features/establishment/RegisterScreenLayout';
import { RegisterStepBar } from '@/src/components/features/establishment/RegisterHeader';
import { AuthButton } from '@/src/components/ui/AuthButton';
import { useEstablishmentRegistration } from '@/src/contexts/EstablishmentRegistrationContext';
import {
  getFirstIncompleteStep,
  isHoursStepComplete,
} from '@/src/utils/establishmentRegistration';
import { getRegistrationStepRoute } from '@/src/utils/registrationNavigation';

export default function RegisterEstablishmentStep3Screen() {
  const { data, updateSchedule } = useEstablishmentRegistration();

  const handleContinue = () => {
    if (!isHoursStepComplete(data)) {
      Alert.alert(
        'Horário incompleto',
        'Ative pelo menos um dia e informe os horários de abertura e fechamento.',
      );
      return;
    }

    const incompleteStep = getFirstIncompleteStep(data);

    if (incompleteStep) {
      Alert.alert(
        'Etapas pendentes',
        'Complete todas as etapas anteriores antes de revisar o cadastro.',
      );
      router.replace(getRegistrationStepRoute(incompleteStep) as never);
      return;
    }

    router.push('/(consumer)/register-establishment/step4');
  };

  const handleSkip = () => {
    const incompleteStep = getFirstIncompleteStep(data);

    if (!incompleteStep) {
      router.push('/(consumer)/register-establishment/step4');
      return;
    }

    Alert.alert(
      'Etapas pendentes',
      'Para revisar o cadastro, todas as etapas precisam estar completas.',
    );
  };

  return (
    <RegisterScreenLayout
      stepBar={
        <RegisterStepBar
          currentStep={3}
          onBack={() => router.back()}
          onSkip={handleSkip}
          showBackLink
          showSkipLink
          title="Quando está aberto?"
        />
      }
    >
      <View style={styles.list}>
        {data.schedule.map((daySchedule) => (
          <BusinessHoursDayCard
            key={daySchedule.day}
            onChange={(nextSchedule) => {
              updateSchedule(
                data.schedule.map((entry) =>
                  entry.day === nextSchedule.day ? nextSchedule : entry,
                ),
              );
            }}
            schedule={daySchedule}
          />
        ))}
      </View>

      <AuthButton label="Continuar" onPress={handleContinue} />
    </RegisterScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
});
