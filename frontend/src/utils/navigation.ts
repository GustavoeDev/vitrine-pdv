import { router } from 'expo-router';

interface NavigateToCategoryOptions {
  replace?: boolean;
  subcategoryId?: string;
}

export function navigateToCategory(
  categoryId: string,
  origin: string,
  options?: NavigateToCategoryOptions,
) {
  const params = {
    id: categoryId,
    origin,
    ...(options?.subcategoryId ? { subcategoryId: options.subcategoryId } : {}),
  };

  if (options?.replace) {
    router.replace({
      pathname: '/(consumer)/categories/[id]',
      params,
    });
    return;
  }

  router.push({
    pathname: '/(consumer)/categories/[id]',
    params,
  });
}
