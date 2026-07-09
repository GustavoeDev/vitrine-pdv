import {
  REGISTRATION_CATEGORIES,
  WEEKDAY_LABELS,
  WEEKDAY_SHORT,
} from '@/src/constants/establishment';
import {
  CreateBusinessHourInput,
  CreateStoreInput,
  DaySchedule,
  EstablishmentRegistrationData,
  StepCompletion,
  Weekday,
} from '@/src/types/establishment';

export function isBusinessStepComplete(data: EstablishmentRegistrationData): boolean {
  return (
    data.name.trim().length > 0 &&
    data.categoryId.length > 0 &&
    data.subcategory.trim().length > 0 &&
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
  return open.trim().length >= 4 && close.trim().length >= 4;
}

export function isHoursStepComplete(data: EstablishmentRegistrationData): boolean {
  const openDays = data.schedule.filter((day) => day.enabled);

  if (openDays.length === 0) {
    return false;
  }

  return openDays.every((day) =>
    day.intervals.some((interval) => isIntervalComplete(interval.open, interval.close)),
  );
}

export function getStepCompletion(data: EstablishmentRegistrationData): StepCompletion {
  return {
    business: isBusinessStepComplete(data),
    location: isLocationStepComplete(data),
    hours: isHoursStepComplete(data),
  };
}

export function areAllStepsComplete(data: EstablishmentRegistrationData): boolean {
  const completion = getStepCompletion(data);
  return completion.business && completion.location && completion.hours;
}

export function getFirstIncompleteStep(
  data: EstablishmentRegistrationData,
): 'business' | 'location' | 'hours' | null {
  const completion = getStepCompletion(data);

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

export function getCategoryLabel(categoryId: string): string {
  return REGISTRATION_CATEGORIES.find((category) => category.id === categoryId)?.label ?? '';
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
            opens_at: interval.open,
            closes_at: interval.close,
          }))
      : [],
  );

  return {
    category_id: data.categoryId,
    name: data.name.trim(),
    description: null,
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
