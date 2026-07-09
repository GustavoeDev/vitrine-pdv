export function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function endOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized;
}

export function formatDatePtBr(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

export function createDefaultPromotionEndDate(startDate = new Date()): Date {
  const endDate = startOfDay(startDate);
  endDate.setDate(endDate.getDate() + 7);
  return endDate;
}

export function isEndDateBeforeStartDate(startDate: Date, endDate: Date): boolean {
  return startOfDay(endDate).getTime() < startOfDay(startDate).getTime();
}
