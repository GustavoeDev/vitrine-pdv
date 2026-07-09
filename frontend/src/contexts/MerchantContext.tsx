import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  merchantProfileMock,
  merchantPromotionsMock,
  merchantStatsByRangeMock,
} from '@/src/mocks/merchant';
import {
  createMerchantProduct,
  deleteMerchantProduct,
  fetchMerchantProducts,
  updateMerchantProduct,
} from '@/src/services/merchantProducts';
import { discoveryKeys } from '@/src/queries/useDiscovery';
import { useAuthStore } from '@/src/stores/authStore';
import {
  MerchantCreateProductInput,
  MerchantCreatePromotionInput,
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

interface MerchantContextValue {
  profile: MerchantProfileData;
  activeStoreId?: string;
  activeStoreName?: string;
  products: MerchantProduct[];
  isLoadingProducts: boolean;
  isSavingProduct: boolean;
  promotions: MerchantPromotion[];
  statsRange: MerchantStatsRange;
  setStatsRange: (range: MerchantStatsRange) => void;
  updateProfile: (patch: Partial<MerchantProfileData>) => void;
  addProduct: (input: MerchantCreateProductInput) => Promise<void>;
  toggleProduct: (productId: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addPromotion: (input: MerchantCreatePromotionInput) => void;
  updatePromotionStatus: (promotionId: string, status: MerchantPromotionStatus) => void;
}

const MerchantContext = createContext<MerchantContextValue | null>(null);

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const userStores = useAuthStore((state) => state.user?.stores ?? []);
  const activeStoreId = resolveMerchantStoreId(userStores);
  const activeStore = resolveMerchantStore(userStores, activeStoreId);
  const hasStore = Boolean(activeStoreId);

  const [profile, setProfile] = useState(merchantProfileMock);
  const [promotions, setPromotions] = useState(merchantPromotionsMock);
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

  const invalidateConsumerProducts = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: discoveryKeys.allStoreProducts });
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
    (input: MerchantCreatePromotionInput) => {
      const selectedProduct = (productsQuery.data ?? []).find(
        (product) => product.id === input.product_id,
      );

      setPromotions((current) => [
        {
          id: `${Date.now()}`,
          store_id: profile.store.id,
          status: 'active',
          banner_url: selectedProduct?.photo_url ?? null,
          original_price: selectedProduct?.price,
          discounted_price: input.discounted_price,
          discount_total: input.discount_total,
          badge_text: input.notify_favorites
            ? 'Favoritos serão avisados'
            : 'Ativa sem notificação',
          product_id: input.product_id ?? null,
          ...input,
        },
        ...current,
      ]);
    },
    [productsQuery.data, profile.store.id],
  );

  const updatePromotionStatus = useCallback(
    (promotionId: string, status: MerchantPromotionStatus) => {
      setPromotions((current) =>
        current.map((promotion) =>
          promotion.id === promotionId ? { ...promotion, status } : promotion,
        ),
      );
    },
    [],
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
      promotions,
      statsRange,
      setStatsRange,
      updateProfile,
      addProduct,
      toggleProduct,
      deleteProduct,
      addPromotion,
      updatePromotionStatus,
    }),
    [
      profile,
      activeStore,
      activeStoreId,
      productsQuery.data,
      productsQuery.isLoading,
      createProductMutation.isPending,
      updateProductMutation.isPending,
      deleteProductMutation.isPending,
      promotions,
      statsRange,
      updateProfile,
      addProduct,
      toggleProduct,
      deleteProduct,
      addPromotion,
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
