import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { createDefaultSchedule } from '@/src/constants/establishment';
import {
  DaySchedule,
  EstablishmentRegistrationData,
  StepCompletion,
} from '@/src/types/establishment';
import {
  areAllStepsComplete,
  getStepCompletion,
} from '@/src/utils/establishmentRegistration';

const initialData: EstablishmentRegistrationData = {
  coverImageUri: null,
  logoImageUri: null,
  name: '',
  categoryId: '',
  subcategory: '',
  phone: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  schedule: createDefaultSchedule(),
};

interface EstablishmentRegistrationContextValue {
  data: EstablishmentRegistrationData;
  stepCompletion: StepCompletion;
  allStepsComplete: boolean;
  updateData: (patch: Partial<EstablishmentRegistrationData>) => void;
  updateSchedule: (schedule: DaySchedule[]) => void;
  resetRegistration: () => void;
}

const EstablishmentRegistrationContext =
  createContext<EstablishmentRegistrationContextValue | null>(null);

export function EstablishmentRegistrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<EstablishmentRegistrationData>(initialData);

  const updateData = useCallback((patch: Partial<EstablishmentRegistrationData>) => {
    setData((current) => ({ ...current, ...patch }));
  }, []);

  const updateSchedule = useCallback((schedule: DaySchedule[]) => {
    setData((current) => ({ ...current, schedule }));
  }, []);

  const resetRegistration = useCallback(() => {
    setData({
      ...initialData,
      schedule: createDefaultSchedule(),
    });
  }, []);

  const stepCompletion = useMemo(() => getStepCompletion(data), [data]);
  const allStepsComplete = useMemo(() => areAllStepsComplete(data), [data]);

  const value = useMemo(
    () => ({
      data,
      stepCompletion,
      allStepsComplete,
      updateData,
      updateSchedule,
      resetRegistration,
    }),
    [allStepsComplete, data, resetRegistration, stepCompletion, updateData, updateSchedule],
  );

  return (
    <EstablishmentRegistrationContext.Provider value={value}>
      {children}
    </EstablishmentRegistrationContext.Provider>
  );
}

export function useEstablishmentRegistration() {
  const context = useContext(EstablishmentRegistrationContext);

  if (!context) {
    throw new Error(
      'useEstablishmentRegistration must be used within EstablishmentRegistrationProvider',
    );
  }

  return context;
}
