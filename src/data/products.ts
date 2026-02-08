export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  isNew?: boolean;
  isBestseller?: boolean;
  description?: string;
  sizes?: string[];
  quantity?: number;
  /** From API when available */
  soldCount?: number;
  rating?: number;
  reviewCount?: number;
  reviews?: ProductReview[];
  ratingDistribution?: { stars: number; count: number }[];
  longDescription?: string;
  colors?: { name: string; hex: string }[];
}

export interface ProductReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  text: string;
  likes: number;
  dislikes: number;
  date: string;
}

export interface ProductDetail extends Product {
  description: string;
  longDescription?: string;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  soldCount: number;
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  ratingDistribution: { stars: number; count: number }[];
}

export const categories = [
  { id: 'sarees', name: 'Sarees', icon: '🥻' },
  { id: 'lehengas', name: 'Lehengas', icon: '👗' },
  { id: 'kurtis', name: 'Kurtis', icon: '👚' },
  { id: 'salwar', name: 'Salwar Suits', icon: '🌸' },
  { id: 'anarkali', name: 'Anarkali', icon: '✨' },
  { id: 'accessories', name: 'Accessories', icon: '💎' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Banarasi Silk Saree',
    price: 4999,
    originalPrice: 6999,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop',
    category: 'sarees',
    isBestseller: true,
  },
  {
    id: '2',
    name: 'Bridal Lehenga Set',
    price: 12999,
    originalPrice: 18999,
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop',
    category: 'lehengas',
    isNew: true,
  },
  {
    id: '3',
    name: 'Embroidered Anarkali',
    price: 3499,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
    category: 'anarkali',
    isBestseller: true,
  },
  {
    id: '4',
    name: 'Cotton Kurti Set',
    price: 1299,
    originalPrice: 1799,
    image: 'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=400&h=500&fit=crop',
    category: 'kurtis',
  },
  {
    id: '5',
    name: 'Chanderi Salwar Suit',
    price: 2799,
    image: 'https://images.unsplash.com/photo-1583391733981-8b530b07ee52?w=400&h=500&fit=crop',
    category: 'salwar',
    isNew: true,
  },
  {
    id: '6',
    name: 'Kundan Jewelry Set',
    price: 1999,
    originalPrice: 2499,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=500&fit=crop',
    category: 'accessories',
  },
  {
    id: '7',
    name: 'Kanjivaram Silk Saree',
    price: 8999,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=500&fit=crop',
    category: 'sarees',
    isBestseller: true,
  },
  {
    id: '8',
    name: 'Designer Lehenga',
    price: 9999,
    originalPrice: 14999,
    image: 'https://images.unsplash.com/photo-1610030469668-5c0e6c1eb7f5?w=400&h=500&fit=crop',
    category: 'lehengas',
  },
];

const categoryDisplayNames: Record<string, string> = {
  sarees: 'Sarees',
  lehengas: 'Lehengas',
  kurtis: 'Kurtis',
  salwar: 'Salwar Suits',
  anarkali: 'Anarkali',
  accessories: 'Accessories',
};

const DEFAULT_RATING_DISTRIBUTION: { stars: number; count: number }[] = [
  { stars: 5, count: 0 },
  { stars: 4, count: 0 },
  { stars: 3, count: 0 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 },
];

export function getProductDetail(product: Product): ProductDetail {
  return {
    ...product,
    description: product.description ?? product.name + '. A beautiful addition to your ethnic wardrobe.',
    longDescription: product.longDescription ?? product.description ?? '',
    images: product.images?.length ? product.images : [product.image],
    colors: product.colors?.length ? product.colors : [{ name: 'As shown', hex: '#8B7355' }],
    sizes: product.sizes?.length ? product.sizes : ['One Size', 'S', 'M', 'L'],
    soldCount: product.soldCount ?? 0,
    rating: product.rating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    reviews: product.reviews ?? [],
    ratingDistribution: product.ratingDistribution?.length ? product.ratingDistribution : DEFAULT_RATING_DISTRIBUTION,
  };
}

export function getCategoryDisplayName(categoryId: string): string {
  return categoryDisplayNames[categoryId] ?? categoryId;
}
