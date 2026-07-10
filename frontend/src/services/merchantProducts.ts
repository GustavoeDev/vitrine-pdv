import { z } from 'zod';

import type {
  MerchantCreateProductInput,
  MerchantProduct,
  MerchantUpdateProductInput,
} from '@/src/types/merchant';

import { api } from './api';
import { uploadMedia } from './media';

const productDiscountSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  original_price: z.string(),
  discounted_price: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  is_active: z.boolean(),
});

const merchantProductSchema = z.object({
  id: z.string().uuid(),
  store_id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  price: z.string(),
  photo_url: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  view_count: z.number(),
  active_discount: productDiscountSchema.nullable(),
});

export type ApiMerchantProduct = z.infer<typeof merchantProductSchema>;

function mapApiMerchantProduct(product: ApiMerchantProduct): MerchantProduct {
  return {
    id: product.id,
    store_id: product.store_id,
    name: product.name,
    description: product.description,
    price: Number.parseFloat(product.price),
    photo_url: product.photo_url,
    is_active: product.is_active,
    created_at: product.created_at,
    view_count: product.view_count,
    active_discount: product.active_discount
      ? {
          id: product.active_discount.id,
          product_id: product.active_discount.product_id,
          original_price: Number.parseFloat(product.active_discount.original_price),
          discounted_price: Number.parseFloat(product.active_discount.discounted_price),
          start_date: product.active_discount.start_date,
          end_date: product.active_discount.end_date,
          is_active: product.active_discount.is_active,
        }
      : null,
  };
}

async function resolveProductPhotoUrl(uri: string | null | undefined): Promise<string | null> {
  if (!uri) {
    return null;
  }

  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }

  return uploadMedia(uri, 'products');
}

export async function fetchMerchantProducts(storeId?: string): Promise<MerchantProduct[]> {
  const { data } = await api.get('/merchant/products/', {
    params: storeId ? { store_id: storeId } : undefined,
  });
  return z.array(merchantProductSchema).parse(data).map(mapApiMerchantProduct);
}

export async function createMerchantProduct(
  input: MerchantCreateProductInput,
  storeId?: string,
): Promise<MerchantProduct> {
  const photo_url = await resolveProductPhotoUrl(input.photo_url);

  const { data } = await api.post('/merchant/products/', {
    name: input.name,
    description: input.description,
    price: input.price,
    photo_url,
    is_active: input.is_active,
    ...(storeId ? { store_id: storeId } : {}),
    ...(input.discounted_price != null ? { discounted_price: input.discounted_price } : {}),
  });

  return mapApiMerchantProduct(merchantProductSchema.parse(data));
}

export async function updateMerchantProduct(
  productId: string,
  input: MerchantUpdateProductInput,
): Promise<MerchantProduct> {
  const photo_url =
    input.photo_url !== undefined ? await resolveProductPhotoUrl(input.photo_url) : undefined;

  const { data } = await api.patch(`/merchant/products/${productId}/`, {
    ...input,
    ...(photo_url !== undefined ? { photo_url } : {}),
  });

  return mapApiMerchantProduct(merchantProductSchema.parse(data));
}

export async function deleteMerchantProduct(productId: string): Promise<void> {
  await api.delete(`/merchant/products/${productId}/`);
}
