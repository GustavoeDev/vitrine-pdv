import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  merchantProfileMock,
  merchantStatsByRangeMock,
} from '@/src/mocks/merchant';
import {
  createMerchantProduct,
  deleteMerchantProduct,
  fetchMerchantProducts,
  updateMerchantProduct,
} from '@/src/services/merchantProducts';
import {
  createMerchantPromotionItem,
  fetchMerchantPromotionsList,
  updateMerchantPromotionItem,
  updateMerchantPromotionItemStatus,
} from '@/src/services/merchantPromotions';
import { discoveryKeys } from '@/src/queries/useDiscovery';
import { promotionKeys } from '@/src/queries/usePromotions';
import { useAuthStore } from '@/src/stores/authStore';
import {
  MerchantCreateProductInput,
  MerchantCreatePromotionInput,
  MerchantUpdatePromotionInput,
  MerchantProfileData,
  MerchantPromotion,
  MerchantPromotionStatus,
  MerchantProduct,
  MerchantStatsRange,
} from '@/src/types/merchant';
import { resolveMerchantStore, resolveMerchantStoreId } from '@/src/utils/merchantStore';

export const merchantProductKeys = {
  all: (storeId?: string) => ['merchant', 'products', storeId ?? 'default'] as const,
};

export const merchantPromotionKeys = {
  all: (storeId?: string) => ['merchant', 'promotions', storeId ?? 'default'] as const,
};

interface MerchantContextValue {
  profile: MerchantProfileData;
  activeStoreId?: string;
  activeStoreName?: string;
  products: MerchantProduct[];
  isLoadingProducts: boolean;
  isSavingProduct: boolean;
  promotions: MerchantPromotion[];
  isLoadingPromotions: boolean;
  isSavingPromotion: boolean;
  statsRange: MerchantStatsRange;
  setStatsRange: (range: MerchantStatsRange) => void;
  updateProfile: (patch: Partial<MerchantProfileData>) => void;
  addProduct: (input: MerchantCreateProductInput) => Promise<void>;
  toggleProduct: (productId: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addPromotion: (input: MerchantCreatePromotionInput) => Promise<void>;
  updatePromotion: (
    promotionId: string,
    input: MerchantUpdatePromotionInput,
  ) => Promise<void>;
  updatePromotionStatus: (
    promotion: MerchantPromotion,
    status: MerchantPromotionStatus,
  ) => Promise<void>;
}

const MerchantContext = createContext<MerchantContextValue | null>(null);

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const userStores = useAuthStore((state) => state.user?.stores ?? []);
  const activeStoreId = resolveMerchantStoreId(userStores);
  const activeStore = resolveMerchantStore(userStores, activeStoreId);
  const hasStore = Boolean(activeStoreId);

  const [profile, setProfile] = useState(merchantProfileMock);
  const [statsRange, setStatsRange] = useState<MerchantStatsRange>('30d');

  useEffect(() => {
    if (!activeStore) {
      return;
    }

    setProfile((current) => ({
      ...current,
      store: {
        ...current.store,
        id: activeStore.id,
        name: activeStore.name,
        status: activeStore.status,
        category_id: activeStore.category_id,
        logo_url: activeStore.logo_url,
        cover_photo_url: activeStore.cover_photo_url,
      },
      category: {
        ...current.category,
        id: activeStore.category_id,
        name: activeStore.category_name,
      },
      logo_url: activeStore.logo_url ?? current.logo_url,
    }));
  }, [activeStore]);

  const productsQuery = useQuery({
    queryKey: merchantProductKeys.all(activeStoreId),
    queryFn: () => fetchMerchantProducts(activeStoreId),
    enabled: hasStore,
  });

  const promotionsQuery = useQuery({
    queryKey: merchantPromotionKeys.all(activeStoreId),
    queryFn: () => fetchMerchantPromotionsList(activeStoreId),
    enabled: hasStore,
  });

  const invalidateConsumerProducts = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: discoveryKeys.allStoreProducts });
  }, [queryClient]);

  const invalidateConsumerPromotions = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: promotionKeys.featured }),
      queryClient.invalidateQueries({ queryKey: promotionKeys.favorites }),
    ]);
  }, [queryClient]);

  const createProductMutation = useMutation({
    mutationFn: (input: MerchantCreateProductInput) =>
      createMerchantProduct(input, activeStoreId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: merchantProductKeys.all(activeStoreId) });
      await invalidateConsumerProducts();
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({
      productId,
      input,
    }: {
      productId: string;
      input: Parameters<typeof updateMerchantProduct>[1];
    }) => updateMerchantProduct(productId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: merchantProductKeys.all(activeStoreId) });
      await invalidateConsumerProducts();
    },
  });

  const createPromotionMutation = useMutation({
    mutationFn: (input: MerchantCreatePromotionInput) =>
      createMerchantPromotionItem(input, activeStoreId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: merchantPromotionKeys.all(activeStoreId) });
      await Promise.all([invalidateConsumerPromotions(), invalidateConsumerProducts()]);
    },
  });

  const updatePromotionStatusMutation = useMutation({
    mutationFn: ({
      promotion,
      status,
    }: {
      promotion: MerchantPromotion;
      status: MerchantPromotionStatus;
    }) => updateMerchantPromotionItemStatus(promotion, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: merchantPromotionKeys.all(activeStoreId) });
      await Promise.all([invalidateConsumerPromotions(), invalidateConsumerProducts()]);
    },
  });

  const updatePromotionMutation = useMutation({
    mutationFn: ({
      promotionId,
      input,
    }: {
      promotionId: string;
      input: MerchantUpdatePromotionInput;
    }) => updateMerchantPromotionItem(promotionId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: merchantPromotionKeys.all(activeStoreId) });
      await Promise.all([invalidateConsumerPromotions(), invalidateConsumerProducts()]);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteMerchantProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: merchantProductKeys.all(activeStoreId) });
      await invalidateConsumerProducts();
    },
  });

  const updateProfile = useCallback((patch: Partial<MerchantProfileData>) => {
    setProfile((current) => ({ ...current, ...patch }));
  }, []);

  const addProduct = useCallback(
    async (input: MerchantCreateProductInput) => {
      await createProductMutation.mutateAsync(input);
    },
    [createProductMutation],
  );

  const toggleProduct = useCallback(
    async (productId: string) => {
      const product = productsQuery.data?.find((item) => item.id === productId);
      if (!product) {
        return;
      }

      await updateProductMutation.mutateAsync({
        productId,
        input: { is_active: !product.is_active },
      });
    },
    [productsQuery.data, updateProductMutation],
  );

  const deleteProduct = useCallback(
    async (productId: string) => {
      await deleteProductMutation.mutateAsync(productId);
    },
    [deleteProductMutation],
  );

  const addPromotion = useCallback(
    async (input: MerchantCreatePromotionInput) => {
      await createPromotionMutation.mutateAsync(input);
    },
    [createPromotionMutation],
  );

  const updatePromotion = useCallback(
    async (promotionId: string, input: MerchantUpdatePromotionInput) => {
      await updatePromotionMutation.mutateAsync({ promotionId, input });
    },
    [updatePromotionMutation],
  );

  const updatePromotionStatus = useCallback(
    async (promotion: MerchantPromotion, status: MerchantPromotionStatus) => {
      await updatePromotionStatusMutation.mutateAsync({ promotion, status });
    },
    [updatePromotionStatusMutation],
  );

  const value = useMemo(
    () => ({
      profile,
      activeStoreId,
      activeStoreName: activeStore?.name,
      products: productsQuery.data ?? [],
      isLoadingProducts: productsQuery.isLoading,
      isSavingProduct:
        createProductMutation.isPending ||
        updateProductMutation.isPending ||
        deleteProductMutation.isPending,
      promotions: promotionsQuery.data ?? [],
      isLoadingPromotions: promotionsQuery.isLoading,
      isSavingPromotion:
        createPromotionMutation.isPending ||
        updatePromotionMutation.isPending ||
        updatePromotionStatusMutation.isPending,
      statsRange,
      setStatsRange,
      updateProfile,
      addProduct,
      toggleProduct,
      deleteProduct,
      addPromotion,
      updatePromotion,
      updatePromotionStatus,
    }),
    [
      profile,
      activeStore,
      activeStoreId,
      productsQuery.data,
      productsQuery.isLoading,
      promotionsQuery.data,
      promotionsQuery.isLoading,
      createProductMutation.isPending,
      updateProductMutation.isPending,
      deleteProductMutation.isPending,
      createPromotionMutation.isPending,
      updatePromotionMutation.isPending,
      updatePromotionStatusMutation.isPending,
      statsRange,
      updateProfile,
      addProduct,
      toggleProduct,
      deleteProduct,
      addPromotion,
      updatePromotion,
      updatePromotionStatus,
    ],
  );

  return <MerchantContext.Provider value={value}>{children}</MerchantContext.Provider>;
}

export function useMerchant() {
  const context = useContext(MerchantContext);

  if (!context) {
    throw new Error('useMerchant must be used within MerchantProvider');
  }

  return context;
}

export function useMerchantStats() {
  const { products, statsRange } = useMerchant();
  const snapshot = merchantStatsByRangeMock[statsRange];

  return {
    ...snapshot,
    activeProducts: products.filter((product) => product.is_active).length,
    totalProducts: products.length,
  };
}
