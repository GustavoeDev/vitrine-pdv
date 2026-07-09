import {
  AddressRecord,
  BusinessHourRecord,
  CategoryRecord,
  ProductDiscountRecord,
  ProductRecord,
  PromotionRecord,
  PromotionStatus,
  StoreRecord,
  UserRecord,
} from '@/src/types';

export type MerchantTabKey = 'dashboard' | 'catalog' | 'promotions' | 'profile';

export type MerchantPromotionStatus = PromotionStatus;
export type MerchantPromotionType = 'daily' | 'product-discount';
export type MerchantCatalogFilter = 'all' | 'active' | 'inactive';
export type MerchantStatsRange = '7d' | '30d' | '3m';

export interface MerchantProduct extends ProductRecord {
  view_count: number;
  active_discount?: ProductDiscountRecord | null;
}

export interface MerchantPromotion extends PromotionRecord {
  promotion_type: MerchantPromotionType;
  product_id?: string | null;
  original_price?: number | null;
  discounted_price?: number | null;
  discount_total?: number | null;
  badge_text?: string | null;
}

export interface MerchantProfileData {
  user: Pick<UserRecord, 'id' | 'name' | 'email' | 'avatar_url' | 'notifications_enabled'>;
  store: StoreRecord;
  category: CategoryRecord;
  address: AddressRecord;
  business_hours: BusinessHourRecord[];
  logo_url?: string | null;
}

export interface MerchantCreateProductInput {
  name: string;
  description: string;
  price: number;
  photo_url: string;
  is_active: boolean;
  discounted_price?: number;
}

export interface MerchantUpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  photo_url?: string | null;
  is_active?: boolean;
}

export interface MerchantCreatePromotionInput {
  promotion_type: MerchantPromotionType;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  notify_favorites: boolean;
  product_id?: string;
  discounted_price?: number;
  discount_total?: number;
}

export interface MerchantStatsSnapshot {
  views: number;
  viewsDelta: string;
  favorites: number;
  favoritesDelta: string;
  activeProducts: number;
  totalProducts: number;
  averageRating: number;
  ratingsCount: number;
}
