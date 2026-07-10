import { CategoryChipItem } from '@/src/types/category';

export const CATEGORY_ICON_MAP: Record<string, Pick<CategoryChipItem, 'icon' | 'iconOutline'>> = {
  Alimentação: { icon: 'restaurant', iconOutline: 'restaurant-outline' },
  Vestuário: { icon: 'shirt', iconOutline: 'shirt-outline' },
  Saúde: { icon: 'medical', iconOutline: 'medical-outline' },
  Pet: { icon: 'paw', iconOutline: 'paw-outline' },
  Casa: { icon: 'home', iconOutline: 'home-outline' },
};

export const ALL_CATEGORIES_CHIP: CategoryChipItem = {
  id: 'all',
  label: 'Todos',
  icon: 'apps',
  iconOutline: 'apps-outline',
};

export const FOOD_CATEGORY_NAME = 'Alimentação';
