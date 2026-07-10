export function sanitizeTimeDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

/** Progressive mask while typing: 1 → 13 → 13:3 → 13:30 */
export function formatTimeWhileTyping(value: string): string {
  const digits = sanitizeTimeDigits(value);

  if (!digits) {
    return '';
  }

  if (digits.length <= 2) {
    return digits;
  }

  const hours = digits.slice(0, 2);
  const minutes = digits.slice(2);

  return `${hours}:${minutes}`;
}

export function isValidTime(value: string): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());

  if (!match) {
    return false;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

/** Final normalization on blur / submit. Accepts HH:MM or hour-only values. */
export function normalizeTimeValue(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (isValidTime(trimmed)) {
    return trimmed;
  }

  const digits = sanitizeTimeDigits(trimmed);

  if (!digits) {
    return null;
  }

  if (digits.length === 1 || digits.length === 2) {
    const hours = Number(digits);

    if (hours >= 0 && hours <= 23) {
      return `${String(hours).padStart(2, '0')}:00`;
    }

    return null;
  }

  if (digits.length === 3) {
    const asHourMinute = `0${digits[0]}:${digits.slice(1)}`;
    if (isValidTime(asHourMinute)) {
      return asHourMinute;
    }

    const asHourWithTens = `${digits.slice(0, 2)}:${digits[2]}0`;
    if (isValidTime(asHourWithTens)) {
      return asHourWithTens;
    }

    return null;
  }

  const formatted = `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  return isValidTime(formatted) ? formatted : null;
}

export function isCompleteTimeValue(value: string): boolean {
  return normalizeTimeValue(value) !== null;
}

export function normalizeTimeForApi(value: string): string {
  return normalizeTimeValue(value) ?? value.trim();
}
