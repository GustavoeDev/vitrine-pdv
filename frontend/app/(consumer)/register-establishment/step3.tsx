import { router } from 'expo-router';

import { BusinessHoursDayCard } from '@/src/components/features/establishment/BusinessHoursDayCard';
import { RegisterScreenLayout } from '@/src/components/features/establishment/RegisterScreenLayout';
import { RegisterStepBar } from '@/src/components/features/establishment/RegisterHeader';
import { AuthButton } from '@/src/components/ui/AuthButton';
import { useAppModal } from '@/src/contexts/AppModalContext';
import { useEstablishmentRegistration } from '@/src/contexts/EstablishmentRegistrationContext';
import {
  getFirstIncompleteStep,
  isHoursStepComplete,
} from '@/src/utils/establishmentRegistration';
import { getRegistrationStepRoute } from '@/src/utils/registrationNavigation';
import { StyleSheet, View } from 'react-native';

export default function RegisterEstablishmentStep3Screen() {
  const { data, updateSchedule } = useEstablishmentRegistration();
  const { showAlert } = useAppModal();

  const handleContinue = async () => {
    if (!isHoursStepComplete(data)) {
      await showAlert({
        title: 'Horário incompleto',
        subtitle: 'Ative pelo menos um dia e informe os horários de abertura e fechamento.',
      });
      return;
    }

    const incompleteStep = getFirstIncompleteStep(data);

    if (incompleteStep) {
      await showAlert({
        title: 'Etapas pendentes',
        subtitle: 'Complete todas as etapas anteriores antes de revisar o cadastro.',
      });
      router.replace(getRegistrationStepRoute(incompleteStep) as never);
      return;
    }

    router.push('/(consumer)/register-establishment/step4');
  };

  const handleSkip = async () => {
    const incompleteStep = getFirstIncompleteStep(data);

    if (!incompleteStep) {
      router.push('/(consumer)/register-establishment/step4');
      return;
    }

    await showAlert({
      title: 'Etapas pendentes',
      subtitle: 'Para revisar o cadastro, todas as etapas precisam estar completas.',
    });
  };

  return (
    <RegisterScreenLayout
      stepBar={
        <RegisterStepBar
          currentStep={3}
          onBack={() => router.back()}
          onSkip={() => void handleSkip()}
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

      <AuthButton label="Continuar" onPress={() => void handleContinue()} />
    </RegisterScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
});
