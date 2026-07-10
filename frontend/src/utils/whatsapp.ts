import { Linking } from 'react-native';

export function buildWhatsAppUrl(phoneNumber: string, message?: string): string | null {
  const digits = phoneNumber.replace(/\D/g, '');

  if (digits.length < 10) {
    return null;
  }

  const normalized = digits.startsWith('55') ? digits : `55${digits}`;
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';

  return `https://wa.me/${normalized}${encodedMessage}`;
}

export async function openWhatsApp(phoneNumber: string, message?: string): Promise<boolean> {
  const url = buildWhatsAppUrl(phoneNumber, message);

  if (!url) {
    return false;
  }

  const canOpen = await Linking.canOpenURL(url);

  if (!canOpen) {
    return false;
  }

  await Linking.openURL(url);
  return true;
}
