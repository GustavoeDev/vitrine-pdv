import { MerchantPromotion, MerchantPromotionStatus } from '@/src/types/merchant';
import { formatDatePtBr } from '@/src/utils/dates';

export function formatPromotionDateRange(startDate: string, endDate: string): string {
  const start = formatDatePtBr(new Date(startDate));
  const end = formatDatePtBr(new Date(endDate));
  return `${start} a ${end}`;
}

export function getPromotionTypeLabel(promotionType: MerchantPromotion['promotion_type']): string {
  if (promotionType === 'daily') {
    return 'Promoção do dia';
  }

  return 'Desconto em produto';
}

export function getPromotionStatusLabel(status: MerchantPromotionStatus): string {
  if (status === 'active') {
    return 'Ativa';
  }

  if (status === 'scheduled') {
    return 'Agendada';
  }

  return 'Encerrada';
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function resolvePromotionDiscountTotal(promotion: MerchantPromotion): string {
  if (
    promotion.original_price == null ||
    promotion.discounted_price == null
  ) {
    return '';
  }

  const discount = promotion.original_price - promotion.discounted_price;
  return discount > 0 ? discount.toFixed(2).replace('.', ',') : '';
}
