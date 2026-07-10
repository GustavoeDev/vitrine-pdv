import { DaySchedule, Weekday } from '@/src/types/establishment';

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  monday: 'Seg',
  tuesday: 'Ter',
  wednesday: 'Qua',
  thursday: 'Qui',
  friday: 'Sex',
  saturday: 'Sáb',
  sunday: 'Dom',
};

export const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1601598851547-4302969d0614?q=80&w=900&auto=format&fit=crop';

export const DEFAULT_LOGO_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=160&auto=format&fit=crop';

function createInterval() {
  return { id: `${Date.now()}-${Math.random()}`, open: '', close: '' };
}

export function createDefaultSchedule(): DaySchedule[] {
  const days: Weekday[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  return days.map((day) => ({
    day,
    enabled: false,
    intervals: [createInterval()],
  }));
}

export function createIntervalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
