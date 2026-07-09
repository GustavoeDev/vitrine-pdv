import {
  WEEKDAY_LABELS,
  WEEKDAY_SHORT,
} from '@/src/constants/establishment';
import type { ApiCategory } from '@/src/types/category';
import { findCategoryById } from '@/src/services/categories';
import {
  CreateBusinessHourInput,
  CreateStoreInput,
  DaySchedule,
  EstablishmentRegistrationData,
  StepCompletion,
  Weekday,
} from '@/src/types/establishment';
import { formatScheduleSummary } from '@/src/utils/businessHours';
import { roundCoordinate } from '@/src/utils/geo';
import { isCompleteTimeValue, normalizeTimeForApi } from '@/src/utils/timeInput';

export { formatScheduleSummary };

export function categoryHasSubcategories(
  categoryId: string,
  categories: ApiCategory[],
): boolean {
  const category = categories.find((item) => item.id === categoryId);
  return (category?.children.length ?? 0) > 0;
}

export function isBusinessStepComplete(
  data: EstablishmentRegistrationData,
  categories: ApiCategory[] = [],
): boolean {
  const requiresSubcategory =
    data.categoryId.length > 0 && categoryHasSubcategories(data.categoryId, categories);
  const subcategoryValid = requiresSubcategory
    ? data.subcategory.trim().length > 0
    : true;

  return (
    data.name.trim().length > 0 &&
    data.categoryId.length > 0 &&
    subcategoryValid &&
    data.phone.trim().length >= 10
  );
}

export function isAddressFieldsComplete(data: EstablishmentRegistrationData): boolean {
  return (
    data.cep.replace(/\D/g, '').length === 8 &&
    data.street.trim().length > 0 &&
    data.number.trim().length > 0 &&
    data.neighborhood.trim().length > 0 &&
    data.city.trim().length > 0 &&
    data.state.trim().length >= 2
  );
}

export function isLocationStepComplete(data: EstablishmentRegistrationData): boolean {
  return (
    isAddressFieldsComplete(data) &&
    data.latitude !== null &&
    data.longitude !== null
  );
}

function isIntervalComplete(open: string, close: string): boolean {
  return isCompleteTimeValue(open) && isCompleteTimeValue(close);
}

export function isHoursStepComplete(data: EstablishmentRegistrationData): boolean {
  const openDays = data.schedule.filter((day) => day.enabled);

  if (openDays.length === 0) {
    return false;
  }

  return openDays.every((day) => {
    const activeIntervals = day.intervals.filter(
      (interval) => interval.open.trim().length > 0 || interval.close.trim().length > 0,
    );

    if (activeIntervals.length === 0) {
      return false;
    }

    return activeIntervals.every((interval) =>
      isIntervalComplete(interval.open, interval.close),
    );
  });
}

export function getStepCompletion(
  data: EstablishmentRegistrationData,
  categories: ApiCategory[] = [],
): StepCompletion {
  return {
    business: isBusinessStepComplete(data, categories),
    location: isLocationStepComplete(data),
    hours: isHoursStepComplete(data),
  };
}

export function areAllStepsComplete(
  data: EstablishmentRegistrationData,
  categories: ApiCategory[] = [],
): boolean {
  const completion = getStepCompletion(data, categories);
  return completion.business && completion.location && completion.hours;
}

export function getFirstIncompleteStep(
  data: EstablishmentRegistrationData,
  categories: ApiCategory[] = [],
): 'business' | 'location' | 'hours' | null {
  const completion = getStepCompletion(data, categories);

  if (!completion.business) {
    return 'business';
  }

  if (!completion.location) {
    return 'location';
  }

  if (!completion.hours) {
    return 'hours';
  }

  return null;
}

export function getCategoryLabel(categoryId: string, categories?: ApiCategory[]): string {
  if (categories) {
    return findCategoryById(categories, categoryId)?.name ?? '';
  }

  return '';
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return phone;
}

export function formatCep(cep: string): string {
  const digits = cep.replace(/\D/g, '');

  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  return cep;
}

export function formatAddress(data: EstablishmentRegistrationData): string {
  const parts = [
    `${data.street}, ${data.number}`,
    data.complement.trim() ? data.complement.trim() : null,
    data.neighborhood,
    `${data.city} - ${data.state.toUpperCase()}`,
  ].filter(Boolean);

  return parts.join(' - ');
}

export function getEstablishmentInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : 'E';
}

export function getWeekdayLabel(day: Weekday): string {
  return WEEKDAY_LABELS[day];
}

function toBusinessWeekday(day: Weekday): CreateBusinessHourInput['weekday'] {
  return day.toUpperCase() as CreateBusinessHourInput['weekday'];
}

export function toCreateStoreInput(data: EstablishmentRegistrationData): CreateStoreInput {
  const business_hours = data.schedule.flatMap((day) =>
    day.enabled
      ? day.intervals
          .filter((interval) => isIntervalComplete(interval.open, interval.close))
          .map((interval) => ({
            weekday: toBusinessWeekday(day.day),
            opens_at: normalizeTimeForApi(interval.open),
            closes_at: normalizeTimeForApi(interval.close),
          }))
      : [],
  );

  return {
    category_id: data.categoryId,
    name: data.name.trim(),
    description: '',
    subcategory: data.subcategory.trim(),
    phone_number: data.phone.trim(),
    cover_photo_url: data.coverImageUri,
    logo_url: data.logoImageUri,
    address: {
      street: data.street.trim(),
      number: data.number.trim(),
      complement: data.complement.trim(),
      district: data.neighborhood.trim(),
      city: data.city.trim(),
      state: data.state.trim().toUpperCase(),
      zipcode: data.cep.replace(/\D/g, ''),
      latitude:
        data.latitude !== null ? roundCoordinate(data.latitude) : null,
      longitude:
        data.longitude !== null ? roundCoordinate(data.longitude) : null,
    },
    business_hours,
  };
}
