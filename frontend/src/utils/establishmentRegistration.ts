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
import { isCompleteTimeValue, normalizeTimeForApi } from '@/src/utils/timeInput';

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

export function isLocationStepComplete(data: EstablishmentRegistrationData): boolean {
  return (
    data.cep.trim().length >= 8 &&
    data.street.trim().length > 0 &&
    data.number.trim().length > 0 &&
    data.neighborhood.trim().length > 0 &&
    data.city.trim().length > 0 &&
    data.state.trim().length >= 2
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

function formatTimeShort(time: string): string {
  const [hours, minutes] = time.split(':');
  const parsedHours = Number(hours);

  if (Number.isNaN(parsedHours)) {
    return time;
  }

  if (minutes === '00' || !minutes) {
    return `${parsedHours}h`;
  }

  return `${parsedHours}h${minutes}`;
}

function formatDayGroup(days: Weekday[], schedule: DaySchedule[]): string | null {
  if (days.length === 0) {
    return null;
  }

  const firstDay = schedule.find((entry) => entry.day === days[0]);

  if (!firstDay || !firstDay.enabled || firstDay.intervals.length === 0) {
    return null;
  }

  const interval = firstDay.intervals.find((item) => isIntervalComplete(item.open, item.close));

  if (!interval) {
    return null;
  }

  const range = `${formatTimeShort(interval.open)}-${formatTimeShort(interval.close)}`;
  const label =
    days.length === 1
      ? WEEKDAY_SHORT[days[0]]
      : `${WEEKDAY_SHORT[days[0]]}-${WEEKDAY_SHORT[days[days.length - 1]]}`;

  return `${label} ${range}`;
}

export function formatScheduleSummary(schedule: DaySchedule[]): string {
  const weekdayOrder: Weekday[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  const openDays = schedule.filter((day) => day.enabled);
  const closedDays = schedule.filter((day) => !day.enabled);

  if (openDays.length === 0) {
    return 'Fechado';
  }

  const groups: string[] = [];
  let currentGroup: Weekday[] = [];

  const signatureForDay = (day: Weekday) => {
    const entry = schedule.find((item) => item.day === day);

    if (!entry?.enabled) {
      return 'closed';
    }

    const interval = entry.intervals.find((item) => isIntervalComplete(item.open, item.close));
    return interval ? `${interval.open}-${interval.close}` : 'invalid';
  };

  weekdayOrder.forEach((day, index) => {
    const entry = schedule.find((item) => item.day === day);

    if (!entry?.enabled) {
      if (currentGroup.length > 0) {
        const formatted = formatDayGroup(currentGroup, schedule);
        if (formatted) {
          groups.push(formatted);
        }
        currentGroup = [];
      }
      return;
    }

    const previousDay = index > 0 ? weekdayOrder[index - 1] : null;
    const sameAsPrevious =
      previousDay && signatureForDay(previousDay) === signatureForDay(day);

    if (sameAsPrevious && currentGroup.length > 0) {
      currentGroup.push(day);
      return;
    }

    if (currentGroup.length > 0) {
      const formatted = formatDayGroup(currentGroup, schedule);
      if (formatted) {
        groups.push(formatted);
      }
    }

    currentGroup = [day];
  });

  if (currentGroup.length > 0) {
    const formatted = formatDayGroup(currentGroup, schedule);
    if (formatted) {
      groups.push(formatted);
    }
  }

  if (closedDays.length === 1 && closedDays[0].day === 'sunday') {
    groups.push('Dom fechado');
  } else if (closedDays.length > 0 && closedDays.length < 7) {
    const closedLabels = closedDays.map((day) => WEEKDAY_SHORT[day.day]);
    groups.push(`${closedLabels.join('/')} fechado`);
  }

  return groups.join(' · ');
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
    },
    business_hours,
  };
}
