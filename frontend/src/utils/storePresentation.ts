import type { ApiBusinessHour, ApiStoreAddress } from '@/src/types/store';
import { formatPhone } from '@/src/utils/establishmentRegistration';

const WEEKDAY_SHORT: Record<string, string> = {
  MONDAY: 'Seg',
  TUESDAY: 'Ter',
  WEDNESDAY: 'Qua',
  THURSDAY: 'Qui',
  FRIDAY: 'Sex',
  SATURDAY: 'Sáb',
  SUNDAY: 'Dom',
};

export function formatStoreCategoryLine(categoryName: string, subcategory?: string | null): string {
  const trimmed = subcategory?.trim();
  return trimmed ? `${categoryName} • ${trimmed}` : categoryName;
}

export function formatRegisteredAt(createdAt: string): string {
  const date = new Date(createdAt);
  return `Cadastrado em ${date.toLocaleDateString('pt-BR')}`;
}

export function formatStorePhone(phoneNumber: string): string {
  return formatPhone(phoneNumber);
}

export function formatStoreAddressLines(address: ApiStoreAddress): [string, string] {
  const line1 = `${address.street}, ${address.number}`;
  const complement = address.complement.trim();
  const district = complement ? `${address.district} — ${complement}` : address.district;
  const line2 = `${district} — ${address.city}, ${address.state} — ${formatZipcode(address.zipcode)}`;
  return [line1, line2];
}

function formatZipcode(zipcode: string): string {
  const digits = zipcode.replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return zipcode;
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

export function formatBusinessHoursSummary(hours: ApiBusinessHour[]): string {
  if (hours.length === 0) {
    return 'Horário não informado';
  }

  const grouped = new Map<string, string[]>();

  hours.forEach((hour) => {
    const signature = `${hour.opens_at}-${hour.closes_at}`;
    const days = grouped.get(signature) ?? [];
    days.push(hour.weekday);
    grouped.set(signature, days);
  });

  const weekdayOrder = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

  const parts: string[] = [];

  grouped.forEach((days, signature) => {
    const sortedDays = [...days].sort(
      (left, right) => weekdayOrder.indexOf(left) - weekdayOrder.indexOf(right),
    );
    const [opensAt, closesAt] = signature.split('-');
    const range = `${formatTimeShort(opensAt)}-${formatTimeShort(closesAt)}`;
    const label =
      sortedDays.length === 1
        ? WEEKDAY_SHORT[sortedDays[0]]
        : `${WEEKDAY_SHORT[sortedDays[0]]}-${WEEKDAY_SHORT[sortedDays[sortedDays.length - 1]]}`;
    parts.push(`${label} ${range}`);
  });

  return parts.join(' · ');
}

export function getStoreInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : 'E';
}
