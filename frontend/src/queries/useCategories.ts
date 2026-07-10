import { useQuery } from '@tanstack/react-query';

import { fetchCategories, fetchCategory } from '@/src/services/categories';

export const categoryKeys = {
  all: ['categories'] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCategory(categoryId?: string) {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId ?? 'unknown'),
    queryFn: () => fetchCategory(categoryId!),
    enabled: Boolean(categoryId) && categoryId !== 'all',
    staleTime: 10 * 60 * 1000,
  });
}
