export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isBestseller?: boolean;
  description?: string;
  sizes?: string[];
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

const productDetails: Record<string, Omit<ProductDetail, keyof Product>> = {
  '1': {
    description:
      'A timeless Banarasi silk saree with intricate zari work. Handwoven in Varanasi, this piece brings heritage elegance to every occasion.',
    longDescription:
      'Crafted by skilled artisans, our Banarasi Silk Saree features traditional motifs and pure zari borders. The rich silk drapes beautifully and is suitable for weddings, festivals, and formal events. Care: Dry clean only. Store in a cool, dry place.',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop',
    ],
    colors: [
      { name: 'Maroon', hex: '#722F37' },
      { name: 'Gold', hex: '#B8860B' },
      { name: 'Ivory', hex: '#F5F5DC' },
    ],
    sizes: ['One Size'],
    soldCount: 2847,
    rating: 4.9,
    reviewCount: 342,
    ratingDistribution: [
      { stars: 5, count: 284 },
      { stars: 4, count: 48 },
      { stars: 3, count: 7 },
      { stars: 2, count: 2 },
      { stars: 1, count: 1 },
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Priya S.',
        rating: 5,
        text: 'Absolutely stunning. The zari work is so fine and the fall is perfect. Got so many compliments at my cousin\'s wedding.',
        likes: 24,
        dislikes: 0,
        date: '2024-01-15',
      },
      {
        id: 'r2',
        author: 'Anjali M.',
        rating: 5,
        text: 'Worth every rupee. The silk quality is exceptional and the border is exactly as shown. Packaging was also very careful.',
        likes: 18,
        dislikes: 0,
        date: '2024-01-10',
      },
      {
        id: 'r3',
        author: 'Kavitha R.',
        rating: 4,
        text: 'Beautiful saree. Slight colour difference in person (more copper undertone) but still gorgeous. Would buy again.',
        likes: 12,
        dislikes: 1,
        date: '2024-01-05',
      },
      {
        id: 'r4',
        author: 'Meera K.',
        rating: 5,
        text: 'My mother loved it for her 60th birthday. The drape is heavy and luxurious. True to size for standard saree length.',
        likes: 31,
        dislikes: 0,
        date: '2023-12-28',
      },
      {
        id: 'r5',
        author: 'Divya P.',
        rating: 5,
        text: 'Second purchase from HFD. Quality is consistent and delivery was fast. This Banarasi is now my go-to for weddings.',
        likes: 15,
        dislikes: 0,
        date: '2023-12-20',
      },
    ],
  },
  '2': {
    description:
      'A show-stopping bridal lehenga set with heavy embroidery and sequin work. Designed for the modern bride who loves tradition with a twist.',
    longDescription:
      'Our Bridal Lehenga Set includes a heavily embroidered lehenga, matching choli, and dupatta. The thread work and sequins are done by hand. Available in multiple colours. Care: Dry clean only. Store in breathable cloth.',
    images: [
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1610030469668-5c0e6c1eb7f5?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800&h=1000&fit=crop',
    ],
    colors: [
      { name: 'Red', hex: '#8B0000' },
      { name: 'Pink', hex: '#DB7093' },
      { name: 'Gold', hex: '#DAA520' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    soldCount: 892,
    rating: 4.8,
    reviewCount: 156,
    ratingDistribution: [
      { stars: 5, count: 128 },
      { stars: 4, count: 22 },
      { stars: 3, count: 4 },
      { stars: 2, count: 1 },
      { stars: 1, count: 1 },
    ],
    reviews: [
      {
        id: 'b1',
        author: 'Neha W.',
        rating: 5,
        text: 'Wore this for my wedding. The embroidery is breathtaking and the fit was perfect after minor alterations. Highly recommend.',
        likes: 42,
        dislikes: 0,
        date: '2024-01-12',
      },
      {
        id: 'b2',
        author: 'Shruti G.',
        rating: 5,
        text: 'Worth the investment. The fabric is heavy and the work is durable. Got so many compliments from guests.',
        likes: 28,
        dislikes: 0,
        date: '2024-01-02',
      },
    ],
  },
};

export function getProductDetail(product: Product): ProductDetail {
  const extra = productDetails[product.id];
  const categoryName = categoryDisplayNames[product.category] ?? product.category;
  if (extra) {
    return { ...product, ...extra };
  }
  return {
    ...product,
    description: product.description ?? product.name + '. A beautiful addition to your ethnic wardrobe from HFD — High Fashion Design.',
    longDescription: product.description ?? '',
    images: [product.image],
    colors: [{ name: 'As shown', hex: '#8B7355' }],
    sizes: product.sizes && product.sizes.length > 0 ? product.sizes : ['One Size', 'S', 'M', 'L'],
    soldCount: Math.floor(Math.random() * 500) + 50,
    rating: 4.5 + Math.random() * 0.5,
    reviewCount: Math.floor(Math.random() * 100) + 10,
    ratingDistribution: [
      { stars: 5, count: 60 },
      { stars: 4, count: 25 },
      { stars: 3, count: 10 },
      { stars: 2, count: 3 },
      { stars: 1, count: 2 },
    ],
    reviews: [
      {
        id: 'd1',
        author: 'Customer',
        rating: 5,
        text: 'Loved the product. Great quality and fast delivery.',
        likes: 5,
        dislikes: 0,
        date: new Date().toISOString().slice(0, 10),
      },
    ],
  };
}

export function getCategoryDisplayName(categoryId: string): string {
  return categoryDisplayNames[categoryId] ?? categoryId;
}
