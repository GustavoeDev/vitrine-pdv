import type { ApiStoreAddress } from '@/src/types/store';
import { formatBusinessHoursSummary } from '@/src/utils/businessHours';
import { formatPhone } from '@/src/utils/establishmentRegistration';

export { formatBusinessHoursSummary };

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

export function getStoreInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : 'E';
}
