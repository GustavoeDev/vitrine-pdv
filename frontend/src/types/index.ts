export type StoreStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
export type PromotionStatus = 'scheduled' | 'active' | 'ended';
export type BusinessWeekday =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  notifications_enabled: boolean;
  created_at: string;
}

export interface ProductViewRecord {
  id: string;
  product_id: string;
  viewed_at: string;
}

export interface AddressRecord {
  id: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface CategoryRecord {
  id: string;
  parent_id: string | null;
  name: string;
  photo_url: string | null;
}

export interface StoreRecord {
  id: string;
  user_id: string;
  category_id: string;
  address_id: string;
  name: string;
  description: string | null;
  subcategory?: string;
  phone_number: string;
  cover_photo_url: string | null;
  logo_url?: string | null;
  status: StoreStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface BusinessHourRecord {
  id: string;
  store_id: string;
  weekday: BusinessWeekday;
  opens_at: string;
  closes_at: string;
}

export interface ProductRecord {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ProductDiscountRecord {
  id: string;
  product_id: string;
  original_price: number;
  discounted_price: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface PromotionRecord {
  id: string;
  store_id: string;
  title: string;
  description: string | null;
  banner_url: string | null;
  start_date: string;
  end_date: string;
  notify_favorites: boolean;
  status: PromotionStatus;
}

export interface ReviewRecord {
  id: string;
  store_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  promotion_id: string;
  is_read: boolean;
  sent_at: string;
}

export interface FavoriteRecord {
  id: string;
  store_id: string;
  user_id: string;
  created_at: string;
}

export interface Category {
  id: string;
  label: string;
  icon?: string;
  iconOutline?: string;
  parent_id?: string | null;
  photo_url?: string | null;
}

export interface Store {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  distance: string;
  rating: number;
  reviews: number;
  coverImageUrl: string;
  avatarUrl: string;
  store_record?: StoreRecord;
  address_record?: AddressRecord;
  category_record?: CategoryRecord;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  category: string;
  description: string;
  price: string;
  imageUrl: string;
  product_record?: ProductRecord;
  active_discount?: ProductDiscountRecord | null;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  review_record?: ReviewRecord;
}

export interface StorePromotion {
  id: string;
  storeId: string;
  title: string;
  description: string;
  validUntil: string;
  imageUrl: string;
  storeName: string;
  storeSubtitle: string;
  storeAvatarUrl: string;
  promotion_record?: PromotionRecord;
}

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'store' | 'product';
  store_id?: string | null;
}

export interface NotificationItem {
  id: string;
  storeName: string;
  message: string;
  time: string;
  unread: boolean;
  avatarUrl: string;
  notificationType?: 'daily_promotion' | 'store_review';
  storeId?: string | null;
  promotionId?: string | null;
  reviewId?: string | null;
  reviewRating?: number | null;
  notification_record?: NotificationRecord;
  promotion_record?: PromotionRecord;
}

export interface NotificationGroup {
  id: string;
  title: string;
  items: NotificationItem[];
}
