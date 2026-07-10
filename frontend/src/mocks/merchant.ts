import {
  MerchantProduct,
  MerchantProfileData,
  MerchantPromotion,
} from '@/src/types/merchant';

const bakeryCover =
  'https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=1200&auto=format&fit=crop';
const bakeryAvatar =
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop';
const breadImage =
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop';
const cakeImage =
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop';
const cheeseImage =
  'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=600&auto=format&fit=crop';

export const merchantProfileMock: MerchantProfileData = {
  user: {
    id: 'user-maria-clara',
    name: 'Maria Clara',
    email: 'maria.clara@email.com',
    avatar_url: null,
    notifications_enabled: true,
  },
  store: {
    id: 'store-padaria-sao-jose',
    user_id: 'user-maria-clara',
    category_id: 'cat-food-padaria',
    address_id: 'address-padaria-sao-jose',
    name: 'Padaria Sao Jose',
    description: 'Padaria artesanal com producao diaria.',
    phone_number: '(88) 99999-0000',
    cover_photo_url: bakeryCover,
    status: 'ACTIVE',
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    created_at: '2026-07-09T08:00:00.000Z',
  },
  category: {
    id: 'cat-food-padaria',
    parent_id: 'cat-food',
    name: 'Padaria artesanal',
    photo_url: null,
  },
  address: {
    id: 'address-padaria-sao-jose',
    street: 'Rua da Matriz',
    number: '123',
    complement: null,
    district: 'Centro',
    city: 'Juazeiro do Norte',
    state: 'CE',
    zipcode: '63000-000',
  },
  business_hours: [
    {
      id: 'bh-1',
      store_id: 'store-padaria-sao-jose',
      weekday: 'MONDAY',
      opens_at: '09:00',
      closes_at: '18:00',
    },
    {
      id: 'bh-2',
      store_id: 'store-padaria-sao-jose',
      weekday: 'SATURDAY',
      opens_at: '09:00',
      closes_at: '18:00',
    },
  ],
  logo_url: bakeryAvatar,
};

export const merchantProductsMock: MerchantProduct[] = [
  {
    id: 'pao-caseiro',
    store_id: 'store-padaria-sao-jose',
    name: 'Pao caseiro',
    description: 'Pao artesanal assado no dia.',
    price: 12,
    photo_url: breadImage,
    is_active: true,
    created_at: '2026-07-09T08:10:00.000Z',
    view_count: 42,
    active_discount: null,
  },
  {
    id: 'bolo-de-milho',
    store_id: 'store-padaria-sao-jose',
    name: 'Bolo de milho',
    description: 'Bolo fofinho com milho selecionado.',
    price: 28,
    photo_url: cakeImage,
    is_active: false,
    created_at: '2026-07-09T08:20:00.000Z',
    view_count: 31,
    active_discount: null,
  },
  {
    id: 'queijo-coalho',
    store_id: 'store-padaria-sao-jose',
    name: 'Queijo coalho',
    description: 'Queijo fresco para cafe da manha.',
    price: 35,
    photo_url: cheeseImage,
    is_active: true,
    created_at: '2026-07-09T08:30:00.000Z',
    view_count: 27,
    active_discount: null,
  },
];

export const merchantPromotionsMock: MerchantPromotion[] = [
  {
    id: 'promo-pao-frances',
    store_id: 'store-padaria-sao-jose',
    promotion_type: 'product-discount',
    status: 'active',
    title: 'Pao Frances - 1kg',
    description: 'Oferta relampago para hoje.',
    banner_url: breadImage,
    start_date: '2026-06-16T08:00:00.000Z',
    end_date: '2026-06-18T20:00:00.000Z',
    notify_favorites: true,
    product_id: 'pao-caseiro',
    original_price: 18.9,
    discounted_price: 14.9,
    discount_total: null,
    badge_text: 'Encerra hoje as 20h',
  },
  {
    id: 'promo-bolo-cenoura',
    store_id: 'store-padaria-sao-jose',
    promotion_type: 'product-discount',
    status: 'scheduled',
    title: 'Bolo de Cenoura Inteiro',
    description: 'Oferta programada para o fim de semana.',
    banner_url: cakeImage,
    start_date: '2026-06-20T08:00:00.000Z',
    end_date: '2026-06-22T20:00:00.000Z',
    notify_favorites: false,
    product_id: 'bolo-de-milho',
    original_price: 25,
    discounted_price: 19.9,
    discount_total: null,
    badge_text: 'Restam 5 unidades',
  },
];

