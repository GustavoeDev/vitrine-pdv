import { createDefaultSchedule, createIntervalId } from '@/src/constants/establishment';
import type { ApiUser } from '@/src/types/auth';
import type { CreateBusinessHourInput, DaySchedule, Weekday } from '@/src/types/establishment';
import type { MerchantProfileData } from '@/src/types/merchant';
import type { ApiBusinessHour } from '@/src/types/store';
import type { ApiMerchantStore } from '@/src/services/merchantStore';
import { isCompleteTimeValue, normalizeTimeForApi } from '@/src/utils/timeInput';

const API_WEEKDAY_TO_DAY: Record<string, Weekday> = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
};

const EMPTY_ID = '00000000-0000-0000-0000-000000000000';

export function createEmptyMerchantProfile(user?: ApiUser | null): MerchantProfileData {
  return {
    user: {
      id: user?.id ?? EMPTY_ID,
      name: user?.name ?? '',
      email: user?.email ?? '',
      avatar_url: user?.avatar_url ?? null,
      notifications_enabled: user?.notifications_enabled ?? true,
    },
    store: {
      id: EMPTY_ID,
      user_id: user?.id ?? EMPTY_ID,
      category_id: EMPTY_ID,
      address_id: EMPTY_ID,
      name: '',
      description: '',
      subcategory: '',
      phone_number: '',
      cover_photo_url: null,
      logo_url: null,
      status: 'PENDING',
      reviewed_by: null,
      reviewed_at: null,
      rejection_reason: null,
      created_at: new Date(0).toISOString(),
    },
    category: {
      id: EMPTY_ID,
      parent_id: null,
      name: '',
      photo_url: null,
    },
    address: {
      id: EMPTY_ID,
      street: '',
      number: '',
      complement: null,
      district: '',
      city: '',
      state: '',
      zipcode: '',
    },
    business_hours: [],
    logo_url: null,
  };
}

export function mapStoreToMerchantProfile(
  store: ApiMerchantStore,
  user: ApiUser,
): MerchantProfileData {
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      notifications_enabled: user.notifications_enabled,
    },
    store: {
      id: store.id,
      user_id: user.id,
      category_id: store.category_id,
      address_id: store.address.id,
      name: store.name,
      description: store.description ?? '',
      subcategory: store.subcategory,
      phone_number: store.phone_number,
      cover_photo_url: store.cover_photo_url,
      logo_url: store.logo_url,
      status: store.status,
      reviewed_by: null,
      reviewed_at: null,
      rejection_reason: null,
      created_at: store.created_at,
    },
    category: {
      id: store.category_id,
      parent_id: null,
      name: store.category_name,
      photo_url: null,
    },
    address: {
      id: store.address.id,
      street: store.address.street,
      number: store.address.number,
      complement: store.address.complement,
      district: store.address.district,
      city: store.address.city,
      state: store.address.state,
      zipcode: store.address.zipcode,
    },
    business_hours: store.business_hours.map((hour) => ({
      id: hour.id,
      store_id: store.id,
      weekday: hour.weekday as MerchantProfileData['business_hours'][number]['weekday'],
      opens_at: hour.opens_at,
      closes_at: hour.closes_at,
    })),
    logo_url: store.logo_url,
  };
}

export function scheduleFromApiBusinessHours(hours: ApiBusinessHour[]): DaySchedule[] {
  const hoursByWeekday = new Map<string, ApiBusinessHour[]>();

  hours.forEach((hour) => {
    const weekdayHours = hoursByWeekday.get(hour.weekday) ?? [];
    weekdayHours.push(hour);
    hoursByWeekday.set(hour.weekday, weekdayHours);
  });

  return createDefaultSchedule().map((day) => {
    const weekday = day.day.toUpperCase();
    const dayHours = hoursByWeekday.get(weekday) ?? [];

    if (dayHours.length === 0) {
      return day;
    }

    return {
      day: day.day,
      enabled: true,
      intervals: dayHours.map((hour) => ({
        id: createIntervalId(),
        open: hour.opens_at.slice(0, 5),
        close: hour.closes_at.slice(0, 5),
      })),
    };
  });
}

function toBusinessWeekday(day: Weekday): CreateBusinessHourInput['weekday'] {
  return day.toUpperCase() as CreateBusinessHourInput['weekday'];
}

export function scheduleToBusinessHoursInput(schedule: DaySchedule[]): CreateBusinessHourInput[] {
  return schedule.flatMap((daySchedule) =>
    daySchedule.enabled
      ? daySchedule.intervals
          .filter((interval) => isCompleteTimeValue(interval.open) && isCompleteTimeValue(interval.close))
          .map((interval) => ({
            weekday: toBusinessWeekday(daySchedule.day),
            opens_at: normalizeTimeForApi(interval.open),
            closes_at: normalizeTimeForApi(interval.close),
          }))
      : [],
  );
}

export function getStoreStatusLabel(status: MerchantProfileData['store']['status']): string {
  if (status === 'ACTIVE') {
    return 'Ativa';
  }

  if (status === 'PENDING') {
    return 'Em análise';
  }

  if (status === 'REJECTED') {
    return 'Recusada';
  }

  return 'Inativa';
}
