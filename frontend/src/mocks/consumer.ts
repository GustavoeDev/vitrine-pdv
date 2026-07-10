import {
  Category,
  NotificationGroup,
  Product,
  Review,
  SearchResult,
  Store,
  StorePromotion,
} from '@/src/types';

const bakeryAvatar =
  'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=160&auto=format&fit=crop';

export const consumerCategories: Category[] = [
  { id: 'all', label: 'Todos', icon: 'apps', iconOutline: 'apps-outline' },
  { id: 'food', label: 'Alimentação', icon: 'restaurant', iconOutline: 'restaurant-outline' },
  { id: 'clothes', label: 'Vestuário', icon: 'shirt', iconOutline: 'shirt-outline' },
  { id: 'health', label: 'Saúde', icon: 'medical', iconOutline: 'medical-outline' },
  { id: 'pet', label: 'Pet', icon: 'paw', iconOutline: 'paw-outline' },
  { id: 'home', label: 'Casa', icon: 'home', iconOutline: 'home-outline' },
];

export const searchCategories: Category[] = [
  { id: 'all', label: 'Todos' },
  { id: 'bakeries', label: 'Padarias' },
  { id: 'markets', label: 'Mercados' },
  { id: 'sweets', label: 'Doces' },
  { id: 'farms', label: 'Fazendas' },
  { id: 'drinks', label: 'Bebidas' },
];

export const nearbyStores: Store[] = [
  {
    id: 'mercadinho-do-ze',
    name: 'Mercadinho do Zé',
    category: 'Alimentação',
    subcategory: 'Hortifruti',
    distance: '1,2 km',
    rating: 4.8,
    reviews: 124,
    coverImageUrl:
      'https://images.unsplash.com/photo-1601598851547-4302969d0614?q=80&w=900&auto=format&fit=crop',
    avatarUrl:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=160&auto=format&fit=crop',
  },
  {
    id: 'moda-da-serra',
    name: 'Moda da Serra',
    category: 'Vestuário',
    subcategory: 'Boutique',
    distance: '2,1 km',
    rating: 4.7,
    reviews: 98,
    coverImageUrl:
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=900&auto=format&fit=crop',
    avatarUrl:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=160&auto=format&fit=crop',
  },
];

export const categoryStores: Store[] = [
  {
    id: 'padaria-sao-jose',
    name: 'Padaria São José',
    category: 'Alimentação',
    subcategory: 'Padaria',
    distance: '1,2 km',
    rating: 4.8,
    reviews: 124,
    coverImageUrl:
      'https://images.unsplash.com/photo-1601598851547-4302969d0614?q=80&w=240&auto=format&fit=crop',
    avatarUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=160&auto=format&fit=crop',
  },
  {
    id: 'mercado-bom-preco',
    name: 'Mercado Bom Preço',
    category: 'Alimentação',
    subcategory: 'Mercado',
    distance: '1,8 km',
    rating: 4.6,
    reviews: 87,
    coverImageUrl:
      'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=240&auto=format&fit=crop',
    avatarUrl:
      'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=160&auto=format&fit=crop',
  },
  {
    id: 'quitanda-da-praca',
    name: 'Quitanda da Praça',
    category: 'Alimentação',
    subcategory: 'Hortifruti',
    distance: '2,4 km',
    rating: 4.5,
    reviews: 64,
    coverImageUrl:
      'https://images.unsplash.com/photo-1579113800032-c38bd7635818?q=80&w=240&auto=format&fit=crop',
    avatarUrl:
      'https://images.unsplash.com/photo-1579113800032-c38bd7635818?q=80&w=160&auto=format&fit=crop',
  },
];

export const consumerStore: Store = {
  id: 'loja-dos-calcados',
  name: 'Loja dos Calçados',
  category: 'Loja de Roupas',
  subcategory: 'Vestuário',
  distance: '1,2 km',
  rating: 4.8,
  reviews: 124,
  coverImageUrl:
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=900&auto=format&fit=crop',
  avatarUrl:
    'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=160&auto=format&fit=crop',
};

export const featuredStores: Store[] = [
  nearbyStores[0],
  {
    ...nearbyStores[1],
    distance: '2,4 km',
  },
  {
    ...nearbyStores[1],
    id: 'moda-da-serra-2',
    distance: '2,4 km',
  },
];

export const favoriteStores: Store[] = Array.from({ length: 4 }, (_, index) => ({
  id: `padaria-sao-jose-${index + 1}`,
  name: 'Padaria São José',
  category: 'Alimentação',
  subcategory: 'Padaria artesanal',
  distance: '1,2 km',
  rating: 4.9,
  reviews: 124,
  coverImageUrl:
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop',
  avatarUrl:
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=160&auto=format&fit=crop',
}));

export const storeProducts: Product[] = [
  {
    id: 'sandalia-feminina',
    storeId: consumerStore.id,
    name: 'Sandália Feminina',
    category: 'Calçados e Acessórios',
    description:
      'Conforto para o dia a dia, com sola leve e acabamento reforçado. Ideal para quem busca praticidade e estilo no comércio local.',
    price: 'R$ 89,90',
    imageUrl:
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'bolo-de-milho',
    storeId: consumerStore.id,
    name: 'Bolo de milho',
    category: 'Alimentação',
    description: 'Bolo caseiro fresquinho, feito com milho selecionado.',
    price: 'R$ 28,00',
    imageUrl:
      'https://images.unsplash.com/photo-1562440499-64c9a111f713?q=80&w=600&auto=format&fit=crop',
  },
];

export const storeReviews: Review[] = [
  {
    id: 'maria',
    authorName: 'Maria',
    rating: 4,
    comment: 'Entrega rápida e produtos ótimos.',
  },
  {
    id: 'joao',
    authorName: 'João',
    rating: 5,
    comment: 'Excelentes óculos',
  },
  {
    id: 'ana',
    authorName: 'Ana',
    rating: 5,
    comment: 'Atendimento muito atencioso e produtos frescos.',
  },
  {
    id: 'carlos',
    authorName: 'Carlos',
    rating: 4,
    comment: 'Bom custo-benefício, volto sempre.',
  },
  {
    id: 'julia',
    authorName: 'Julia',
    rating: 5,
    comment: 'A melhor padaria do bairro.',
  },
];

export const promotionOfTheDay: StorePromotion = {
  id: 'cafe-da-manha-especial',
  storeId: 'padaria-sao-jose',
  title: 'Café da manhã completo com desconto especial',
  description:
    'Pão francês, café coado e suco natural em uma combinação especial para começar o dia gastando menos. Oferta válida para retirada na loja durante o período informado.',
  validUntil: '20/06/2026',
  imageUrl:
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=900&auto=format&fit=crop',
  storeName: 'Padaria São José',
  storeSubtitle: 'Loja parceira da promoção',
  storeAvatarUrl:
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=160&auto=format&fit=crop',
};

export const searchResults: SearchResult[] = [
  { id: 'loja-dos-calcados', title: 'Loja dos Calçados', subtitle: 'Loja de Roupas', type: 'store' },
  { id: 'pao-caseiro', title: 'Pão caseiro', subtitle: 'Produto', type: 'product' },
  { id: 'mercado-bom-preco', title: 'Mercado Bom Preço', subtitle: 'Mercado', type: 'store' },
  { id: 'queijo-coalho', title: 'Queijo coalho', subtitle: 'Produto', type: 'product' },
];

export const notificationGroups: NotificationGroup[] = [
  {
    id: 'today',
    title: 'Hoje',
    items: [
      {
        id: 'padaria-pao-frances',
        storeName: 'Padaria São José',
        message: 'Pão francês está com promoção 30% off! ⭐',
        time: 'há 2h',
        unread: true,
        avatarUrl: bakeryAvatar,
      },
      {
        id: 'mercadinho-cerveja',
        storeName: 'Mercadinho do Zé',
        message: 'Cerveja em promoção por tempo limitado 🍺',
        time: 'há 4h',
        unread: true,
        avatarUrl: bakeryAvatar,
      },
    ],
  },
  {
    id: 'yesterday',
    title: 'Ontem',
    items: [
      {
        id: 'bolo-cenoura-ontem',
        storeName: 'Bolo de Cenoura Inteiro',
        message: 'Bolo de Cenoura com desconto de 20% 🎂',
        time: 'ontem',
        unread: false,
        avatarUrl: bakeryAvatar,
      },
    ],
  },
  {
    id: 'week',
    title: 'Esta semana',
    items: [
      {
        id: 'bolo-cenoura-semana',
        storeName: 'Bolo de Cenoura Inteiro',
        message: 'Bolo de Cenoura com desconto de 20% 🎂',
        time: 'ontem',
        unread: false,
        avatarUrl: bakeryAvatar,
      },
    ],
  },
];
