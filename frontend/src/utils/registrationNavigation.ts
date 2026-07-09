import { RegistrationStep } from '@/src/types/establishment';

const stepRoutes: Record<RegistrationStep, string> = {
  business: '/(consumer)/register-establishment/step1',
  location: '/(consumer)/register-establishment/step2',
  hours: '/(consumer)/register-establishment/step3',
  review: '/(consumer)/register-establishment/step4',
};

export function getRegistrationStepRoute(step: RegistrationStep): string {
  return stepRoutes[step];
}
