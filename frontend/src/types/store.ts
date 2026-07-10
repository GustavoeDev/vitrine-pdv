export type StoreStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';

export interface ApiStoreSummary {
  id: string;
  name: string;
  status: StoreStatus;
  category_id: string;
  category_name: string;
  subcategory: string | null;
  logo_url: string | null;
  cover_photo_url: string | null;
}

export interface ApiStoreAddress {
  id: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface ApiBusinessHour {
  id: string;
  weekday: string;
  opens_at: string;
  closes_at: string;
}

export interface ApiStore extends ApiStoreSummary {
  description: string;
  phone_number: string;
  address: ApiStoreAddress;
  business_hours: ApiBusinessHour[];
  created_at: string;
}

export interface AdminStoreListItem extends ApiStoreSummary {
  address_summary: string;
  created_at: string;
}

export interface AdminStoreOwner {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

export interface AdminStoreDetail extends ApiStore {
  owner: AdminStoreOwner;
  rejection_reason: string;
  reviewed_at: string | null;
}

export interface AdminStoreSummary {
  pending: number;
  active: number;
  inactive: number;
  rejected: number;
}

export type AdminStoreFilter = StoreStatus;
