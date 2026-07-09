import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { createDefaultSchedule } from '@/src/constants/establishment';
import { useCategories } from '@/src/queries/useCategories';
import { registerEstablishment } from '@/src/services/stores';
import {
  CreateStoreInput,
  DaySchedule,
  EstablishmentRegistrationData,
  StepCompletion,
} from '@/src/types/establishment';
import type { ApiStore } from '@/src/types/store';
import {
  areAllStepsComplete,
  getStepCompletion,
  toCreateStoreInput,
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
  cityStateLocked: false,
  latitude: null,
  longitude: null,
  schedule: createDefaultSchedule(),
};

interface EstablishmentRegistrationContextValue {
  data: EstablishmentRegistrationData;
  submittedStore: ApiStore | null;
  isSubmitting: boolean;
  stepCompletion: StepCompletion;
  allStepsComplete: boolean;
  updateData: (patch: Partial<EstablishmentRegistrationData>) => void;
  updateSchedule: (schedule: DaySchedule[]) => void;
  buildStorePayload: () => CreateStoreInput;
  submitRegistration: () => Promise<ApiStore>;
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
  const [submittedStore, setSubmittedStore] = useState<ApiStore | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: categories = [] } = useCategories();

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
    setSubmittedStore(null);
    setIsSubmitting(false);
  }, []);

  const submitRegistration = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const store = await registerEstablishment(data);
      setSubmittedStore(store);
      return store;
    } finally {
      setIsSubmitting(false);
    }
  }, [data]);

  const stepCompletion = useMemo(() => getStepCompletion(data, categories), [categories, data]);
  const allStepsComplete = useMemo(
    () => areAllStepsComplete(data, categories),
    [categories, data],
  );

  const value = useMemo(
    () => ({
      data,
      submittedStore,
      isSubmitting,
      stepCompletion,
      allStepsComplete,
      updateData,
      updateSchedule,
      buildStorePayload: () => toCreateStoreInput(data),
      submitRegistration,
      resetRegistration,
    }),
    [
      allStepsComplete,
      data,
      isSubmitting,
      resetRegistration,
      stepCompletion,
      submitRegistration,
      submittedStore,
      updateData,
      updateSchedule,
    ],
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
