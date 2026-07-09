import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import {
  merchantProductsMock,
  merchantProfileMock,
  merchantPromotionsMock,
  merchantStatsByRangeMock,
} from '@/src/mocks/merchant';
import {
  MerchantCreateProductInput,
  MerchantCreatePromotionInput,
  MerchantProfileData,
  MerchantPromotion,
  MerchantPromotionStatus,
  MerchantProduct,
  MerchantStatsRange,
} from '@/src/types/merchant';

interface MerchantContextValue {
  profile: MerchantProfileData;
  products: MerchantProduct[];
  promotions: MerchantPromotion[];
  statsRange: MerchantStatsRange;
  setStatsRange: (range: MerchantStatsRange) => void;
  updateProfile: (patch: Partial<MerchantProfileData>) => void;
  addProduct: (input: MerchantCreateProductInput) => void;
  toggleProduct: (productId: string) => void;
  deleteProduct: (productId: string) => void;
  addPromotion: (input: MerchantCreatePromotionInput) => void;
  updatePromotionStatus: (promotionId: string, status: MerchantPromotionStatus) => void;
}

const MerchantContext = createContext<MerchantContextValue | null>(null);

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState(merchantProfileMock);
  const [products, setProducts] = useState(merchantProductsMock);
  const [promotions, setPromotions] = useState(merchantPromotionsMock);
  const [statsRange, setStatsRange] = useState<MerchantStatsRange>('30d');

  const updateProfile = useCallback((patch: Partial<MerchantProfileData>) => {
    setProfile((current) => ({ ...current, ...patch }));
  }, []);

  const addProduct = useCallback((input: MerchantCreateProductInput) => {
    const productId = `${Date.now()}`;
    const createdAt = new Date().toISOString();

    setProducts((current) => [
      {
        id: productId,
        store_id: profile.store.id,
        created_at: createdAt,
        view_count: 0,
        active_discount: input.discounted_price
          ? {
              id: `discount-${productId}`,
              product_id: productId,
              original_price: input.price,
              discounted_price: input.discounted_price,
              start_date: createdAt,
              end_date: createdAt,
              is_active: true,
            }
          : null,
        ...input,
      },
      ...current,
    ]);
  }, [profile.store.id]);

  const toggleProduct = useCallback((productId: string) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, is_active: !product.is_active } : product,
      ),
    );
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts((current) => current.filter((product) => product.id !== productId));
  }, []);

  const addPromotion = useCallback(
    (input: MerchantCreatePromotionInput) => {
      const selectedProduct = products.find((product) => product.id === input.product_id);

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
            ? 'Favoritos serao avisados'
            : 'Ativa sem notificacao',
          product_id: input.product_id ?? null,
          ...input,
        },
        ...current,
      ]);
    },
    [products, profile.store.id],
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
      products,
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
      products,
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
