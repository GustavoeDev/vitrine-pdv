export interface Category {
  id: string;
  label: string;
  icon?: string;
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
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  category: string;
  description: string;
  price: string;
  imageUrl: string;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
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
}

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'store' | 'product';
}

export interface NotificationItem {
  id: string;
  storeName: string;
  message: string;
  time: string;
  unread: boolean;
  avatarUrl: string;
}

export interface NotificationGroup {
  id: string;
  title: string;
  items: NotificationItem[];
}
