import { WEEKDAY_SHORT } from '@/src/constants/establishment';
import type { DaySchedule, Weekday } from '@/src/types/establishment';
import type { ApiBusinessHour } from '@/src/types/store';
import { isCompleteTimeValue } from '@/src/utils/timeInput';

export interface BusinessHoursRow {
  dayLabel: string;
  hoursLabel: string;
  isClosed?: boolean;
}

const SCHEDULE_WEEKDAY_ORDER: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const API_WEEKDAY_ORDER = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

const API_WEEKDAY_SHORT: Record<string, string> = {
  MONDAY: 'Seg',
  TUESDAY: 'Ter',
  WEDNESDAY: 'Qua',
  THURSDAY: 'Qui',
  FRIDAY: 'Sex',
  SATURDAY: 'Sáb',
  SUNDAY: 'Dom',
};

export function formatTimeShort(time: string): string {
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

function formatIntervalRange(opensAt: string, closesAt: string): string {
  return `${formatTimeShort(opensAt)}-${formatTimeShort(closesAt)}`;
}

const INTERVAL_SEPARATOR = '|';
const TIME_PAIR_SEPARATOR = '~';

function encodeIntervalsSignature(
  intervals: Array<{ open: string; close: string } | { opens_at: string; closes_at: string }>,
): string {
  return intervals
    .map((interval) => {
      const open = 'opens_at' in interval ? interval.opens_at : interval.open;
      const close = 'closes_at' in interval ? interval.closes_at : interval.close;
      return `${open}${TIME_PAIR_SEPARATOR}${close}`;
    })
    .join(INTERVAL_SEPARATOR);
}

function decodeIntervalsSignature(signature: string): string {
  return signature
    .split(INTERVAL_SEPARATOR)
    .map((interval) => {
      const [open, close] = interval.split(TIME_PAIR_SEPARATOR);
      return formatIntervalRange(open, close);
    })
    .join(', ');
}

function formatDayRangeLabel(
  days: string[],
  labels: Record<string, string>,
): string {
  if (days.length === 1) {
    return labels[days[0]] ?? days[0];
  }

  return `${labels[days[0]]}-${labels[days[days.length - 1]]}`;
}

function groupConsecutiveBySignature<T extends string>(
  orderedDays: T[],
  signatureForDay: (day: T) => string,
): Array<{ days: T[]; signature: string }> {
  const groups: Array<{ days: T[]; signature: string }> = [];
  let currentGroup: T[] = [];

  orderedDays.forEach((day, index) => {
    const signature = signatureForDay(day);
    const previousDay = index > 0 ? orderedDays[index - 1] : null;
    const sameAsPrevious =
      previousDay !== null && signatureForDay(previousDay) === signature;

    if (sameAsPrevious && currentGroup.length > 0) {
      currentGroup.push(day);
      return;
    }

    if (currentGroup.length > 0) {
      groups.push({
        days: currentGroup,
        signature: signatureForDay(currentGroup[0]),
      });
    }

    currentGroup = [day];
  });

  if (currentGroup.length > 0) {
    groups.push({
      days: currentGroup,
      signature: signatureForDay(currentGroup[0]),
    });
  }

  return groups;
}

function isIntervalComplete(open: string, close: string): boolean {
  return isCompleteTimeValue(open) && isCompleteTimeValue(close);
}

function buildRowsFromGroups<T extends string>(
  groups: Array<{ days: T[]; signature: string }>,
  labels: Record<string, string>,
  formatHours: (signature: string, days: T[]) => string,
): BusinessHoursRow[] {
  const rows: BusinessHoursRow[] = [];
  const closedGroups: string[] = [];

  groups.forEach(({ days, signature }) => {
    if (signature === 'closed') {
      closedGroups.push(...days.map((day) => labels[day] ?? day));
      return;
    }

    rows.push({
      dayLabel: formatDayRangeLabel(days, labels),
      hoursLabel: formatHours(signature, days),
    });
  });

  if (closedGroups.length === 1) {
    rows.push({
      dayLabel: closedGroups[0],
      hoursLabel: 'Fechado',
      isClosed: true,
    });
  } else if (closedGroups.length > 1) {
    rows.push({
      dayLabel: closedGroups.join('/'),
      hoursLabel: 'Fechado',
      isClosed: true,
    });
  }

  return rows;
}

export function buildBusinessHoursRowsFromSchedule(
  schedule: DaySchedule[],
): BusinessHoursRow[] {
  const signatureForDay = (day: Weekday) => {
    const entry = schedule.find((item) => item.day === day);

    if (!entry?.enabled) {
      return 'closed';
    }

    const intervals = entry.intervals.filter((interval) =>
      isIntervalComplete(interval.open, interval.close),
    );

    return intervals.length > 0 ? encodeIntervalsSignature(intervals) : 'invalid';
  };

  const groups = groupConsecutiveBySignature(SCHEDULE_WEEKDAY_ORDER, signatureForDay);

  const rows = buildRowsFromGroups(
    groups.filter((group) => group.signature !== 'invalid'),
    WEEKDAY_SHORT,
    (signature) => decodeIntervalsSignature(signature),
  );

  if (schedule.every((day) => !day.enabled)) {
    return [{ dayLabel: 'Todos os dias', hoursLabel: 'Fechado', isClosed: true }];
  }

  return rows;
}

export function buildBusinessHoursRowsFromApi(
  hours: ApiBusinessHour[],
): BusinessHoursRow[] {
  if (hours.length === 0) {
    return [{ dayLabel: 'Horário', hoursLabel: 'Não informado', isClosed: true }];
  }

  const hoursByWeekday = new Map<string, ApiBusinessHour[]>();

  hours.forEach((hour) => {
    const weekdayHours = hoursByWeekday.get(hour.weekday) ?? [];
    weekdayHours.push(hour);
    hoursByWeekday.set(hour.weekday, weekdayHours);
  });

  const signatureForDay = (weekday: (typeof API_WEEKDAY_ORDER)[number]) => {
    const dayHours = hoursByWeekday.get(weekday) ?? [];

    if (dayHours.length === 0) {
      return 'closed';
    }

    return encodeIntervalsSignature(
      [...dayHours].sort((left, right) => left.opens_at.localeCompare(right.opens_at)),
    );
  };

  const groups = groupConsecutiveBySignature([...API_WEEKDAY_ORDER], signatureForDay);

  return buildRowsFromGroups(
    groups,
    API_WEEKDAY_SHORT,
    (signature) => decodeIntervalsSignature(signature),
  );
}

export function formatScheduleSummary(schedule: DaySchedule[]): string {
  const rows = buildBusinessHoursRowsFromSchedule(schedule);

  if (rows.length === 0) {
    return 'Fechado';
  }

  return rows
    .map((row) =>
      row.isClosed ? `${row.dayLabel} fechado` : `${row.dayLabel} ${row.hoursLabel}`,
    )
    .join(' · ');
}

export function formatBusinessHoursSummary(hours: ApiBusinessHour[]): string {
  return buildBusinessHoursRowsFromApi(hours)
    .map((row) =>
      row.isClosed ? `${row.dayLabel} fechado` : `${row.dayLabel} ${row.hoursLabel}`,
    )
    .join(' · ');
}
