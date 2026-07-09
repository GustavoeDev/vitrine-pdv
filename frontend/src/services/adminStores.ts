import { z } from 'zod';

import type {
  AdminStoreDetail,
  AdminStoreFilter,
  AdminStoreListItem,
  AdminStoreSummary,
} from '@/src/types/store';

import { api } from './api';

const storeSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED']),
  category_id: z.string().uuid(),
  category_name: z.string(),
  subcategory: z.string().nullable(),
  logo_url: z.string().nullable(),
  cover_photo_url: z.string().nullable(),
});

const adminStoreListItemSchema = storeSummarySchema.extend({
  address_summary: z.string(),
  created_at: z.string(),
});

const addressSchema = z.object({
  id: z.string().uuid(),
  street: z.string(),
  number: z.string(),
  complement: z.string(),
  district: z.string(),
  city: z.string(),
  state: z.string(),
  zipcode: z.string(),
});

const businessHourSchema = z.object({
  id: z.string().uuid(),
  weekday: z.string(),
  opens_at: z.string(),
  closes_at: z.string(),
});

const adminStoreDetailSchema = storeSummarySchema.extend({
  description: z.string(),
  phone_number: z.string(),
  address: addressSchema,
  business_hours: z.array(businessHourSchema),
  created_at: z.string(),
  owner: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    avatar_url: z.string().nullable(),
  }),
  rejection_reason: z.string(),
  reviewed_at: z.string().nullable(),
});

const adminSummarySchema = z.object({
  pending: z.number(),
  active: z.number(),
  inactive: z.number(),
  rejected: z.number(),
});

export async function fetchAdminStoreSummary(): Promise<AdminStoreSummary> {
  const { data } = await api.get('/admin/stores/summary/');
  return adminSummarySchema.parse(data);
}

export async function fetchAdminStores(status: AdminStoreFilter): Promise<AdminStoreListItem[]> {
  const { data } = await api.get('/admin/stores/', { params: { status } });
  return z.array(adminStoreListItemSchema).parse(data);
}

export async function fetchAdminStore(storeId: string): Promise<AdminStoreDetail> {
  const { data } = await api.get(`/admin/stores/${storeId}/`);
  return adminStoreDetailSchema.parse(data);
}

export async function approveAdminStore(storeId: string): Promise<AdminStoreDetail> {
  const { data } = await api.post(`/admin/stores/${storeId}/approve/`);
  return adminStoreDetailSchema.parse(data);
}

export async function rejectAdminStore(
  storeId: string,
  rejectionReason: string,
): Promise<AdminStoreDetail> {
  const { data } = await api.post(`/admin/stores/${storeId}/reject/`, {
    rejection_reason: rejectionReason,
  });
  return adminStoreDetailSchema.parse(data);
}
