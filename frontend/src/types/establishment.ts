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
  cityStateLocked: boolean;
  latitude: number | null;
  longitude: number | null;
  schedule: DaySchedule[];
}

export type StepCompletion = Record<'business' | 'location' | 'hours', boolean>;

export interface CreateStoreAddressInput {
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  zipcode: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CreateBusinessHourInput {
  weekday: Uppercase<Weekday>;
  opens_at: string;
  closes_at: string;
}

export interface CreateStoreInput {
  category_id: string;
  name: string;
  description?: string | null;
  subcategory?: string | null;
  phone_number: string;
  cover_photo_url?: string | null;
  logo_url?: string | null;
  address: CreateStoreAddressInput;
  business_hours: CreateBusinessHourInput[];
}
