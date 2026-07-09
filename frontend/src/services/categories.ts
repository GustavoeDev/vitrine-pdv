import { z } from 'zod';

import { ALL_CATEGORIES_CHIP, CATEGORY_ICON_MAP } from '@/src/constants/categoryIcons';
import type { ApiCategory, CategoryChipItem } from '@/src/types/category';

import { api } from './api';

const categorySchema: z.ZodType<ApiCategory> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    parent_id: z.string().uuid().nullable(),
    name: z.string(),
    photo_url: z.string().nullable(),
    children: z.array(categorySchema),
  }),
);

export function mapCategoryToChip(category: ApiCategory): CategoryChipItem {
  return {
    id: category.id,
    label: category.name,
    ...CATEGORY_ICON_MAP[category.name],
  };
}

export function mapRootCategoriesToChips(categories: ApiCategory[]): CategoryChipItem[] {
  return [ALL_CATEGORIES_CHIP, ...categories.map(mapCategoryToChip)];
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const { data } = await api.get('/categories/');
  return z.array(categorySchema).parse(data);
}

export async function fetchCategory(categoryId: string): Promise<ApiCategory> {
  const { data } = await api.get(`/categories/${categoryId}/`);
  return categorySchema.parse(data);
}

export function findCategoryById(
  categories: ApiCategory[],
  categoryId: string,
): ApiCategory | undefined {
  for (const category of categories) {
    if (category.id === categoryId) {
      return category;
    }

    const childMatch = category.children.find((child) => child.id === categoryId);
    if (childMatch) {
      return childMatch;
    }
  }

  return undefined;
}

export function findFoodCategory(categories: ApiCategory[]): ApiCategory | undefined {
  return categories.find((category) => category.name === 'Alimentação');
}

export function resolveCategoryRoute(
  categoryId: string,
  allCategories: ApiCategory[],
): { parentId: string; initialSubcategoryId: string | null } {
  if (categoryId === 'all') {
    return { parentId: 'all', initialSubcategoryId: null };
  }

  const category = findCategoryById(allCategories, categoryId);
  if (!category) {
    return { parentId: categoryId, initialSubcategoryId: null };
  }

  if (category.parent_id) {
    return { parentId: category.parent_id, initialSubcategoryId: category.id };
  }

  return { parentId: category.id, initialSubcategoryId: null };
}
