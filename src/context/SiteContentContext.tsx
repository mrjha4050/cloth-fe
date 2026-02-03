import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Product } from '@/data/products';
import { products as defaultProducts } from '@/data/products';
import { categories } from '@/data/products';

const STORAGE_KEYS = {
  banner: 'hfd_site_banner',
  hero: 'hfd_site_hero',
  headings: 'hfd_site_headings',
  products: 'hfd_site_products',
} as const;

export interface BannerContent {
  text: string;
}

export interface HeroContent {
  badge: string;
  headlineLine1: string;
  headlineLine2: string;
  description: string;
  imageUrl: string;
  ctaPrimary: string;
  ctaSecondary: string;
  trendingLabel: string;
  trendingSubtext: string;
}

export interface HeadingsContent {
  bestsellingTitle: string;
  bestsellingSubtitle: string;
  categoriesTitle: string;
  categoriesSubtitle: string;
}

const DEFAULT_BANNER: BannerContent = {
  text: '✨ Free Shipping on orders above ₹2,999 | Use code ETHNIC20 for 20% off ✨',
};

const DEFAULT_HERO: HeroContent = {
  badge: '✨ New Wedding Collection 2024',
  headlineLine1: 'Celebrate Your',
  headlineLine2: 'Indian Heritage',
  description:
    'Discover exquisite ethnic wear handcrafted with love. From traditional sarees to contemporary lehengas, find your perfect festive outfit.',
  imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=750&fit=crop',
  ctaPrimary: 'Shop Collection',
  ctaSecondary: 'View Lookbook',
  trendingLabel: '🔥 Trending Now',
  trendingSubtext: 'Bridal Lehengas',
};

const DEFAULT_HEADINGS: HeadingsContent = {
  bestsellingTitle: 'Bestselling Collection',
  bestsellingSubtitle: 'Our most loved pieces chosen by thousands of happy customers',
  categoriesTitle: 'Shop by Category',
  categoriesSubtitle: 'Explore our curated collection of traditional and contemporary Indian wear',
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.products);
    if (!raw) return defaultProducts;
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultProducts;
  } catch {
    return defaultProducts;
  }
}

interface SiteContentContextValue {
  banner: BannerContent;
  hero: HeroContent;
  headings: HeadingsContent;
  products: Product[];
  categories: typeof categories;
  setBanner: (banner: BannerContent) => void;
  setHero: (hero: HeroContent) => void;
  setHeadings: (headings: HeadingsContent) => void;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  resetToDefaults: () => void;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [banner, setBannerState] = useState<BannerContent>(() =>
    loadJson(STORAGE_KEYS.banner, DEFAULT_BANNER)
  );
  const [hero, setHeroState] = useState<HeroContent>(() =>
    loadJson(STORAGE_KEYS.hero, DEFAULT_HERO)
  );
  const [headings, setHeadingsState] = useState<HeadingsContent>(() =>
    loadJson(STORAGE_KEYS.headings, DEFAULT_HEADINGS)
  );
  const [products, setProductsState] = useState<Product[]>(loadProducts);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.banner, JSON.stringify(banner));
  }, [banner]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.hero, JSON.stringify(hero));
  }, [hero]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.headings, JSON.stringify(headings));
  }, [headings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  }, [products]);

  const setBanner = useCallback((b: BannerContent) => setBannerState(b), []);
  const setHero = useCallback((h: HeroContent) => setHeroState(h), []);
  const setHeadings = useCallback((h: HeadingsContent) => setHeadingsState(h), []);

  const setProducts = useCallback((p: Product[]) => setProductsState(p), []);

  const addProduct = useCallback((product: Product) => {
    setProductsState((prev) => {
      const maxId = prev.length
        ? Math.max(...prev.map((p) => parseInt(p.id, 10) || 0))
        : 0;
      const id = String(maxId + 1);
      return [...prev, { ...product, id }];
    });
  }, []);

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      setProductsState((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    []
  );

  const removeProduct = useCallback((id: string) => {
    setProductsState((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const resetToDefaults = useCallback(() => {
    setBannerState(DEFAULT_BANNER);
    setHeroState(DEFAULT_HERO);
    setHeadingsState(DEFAULT_HEADINGS);
    setProductsState(defaultProducts);
  }, []);

  const value: SiteContentContextValue = {
    banner,
    hero,
    headings,
    products,
    categories,
    setBanner,
    setHero,
    setHeadings,
    setProducts,
    addProduct,
    updateProduct,
    removeProduct,
    resetToDefaults,
  };

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used within SiteContentProvider');
  return ctx;
}
