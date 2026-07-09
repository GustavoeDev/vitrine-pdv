export type RegistrationStep = 'business' | 'location' | 'hours' | 'review';

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface TimeInterval {
  id: string;
  open: string;
  close: string;
}

export interface DaySchedule {
  day: Weekday;
  enabled: boolean;
  intervals: TimeInterval[];
}

export interface EstablishmentRegistrationData {
  coverImageUri: string | null;
  logoImageUri: string | null;
  name: string;
  categoryId: string;
  subcategory: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  schedule: DaySchedule[];
}

export type StepCompletion = Record<'business' | 'location' | 'hours', boolean>;
