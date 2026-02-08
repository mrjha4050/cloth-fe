import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { categories, type Product } from '@/data/products';
import { products as productApi, admin as adminApi } from '@/lib/api';
import { toast } from 'sonner';

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
  addProduct: (product: Product) => Promise<boolean>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  removeProduct: (id: string) => Promise<boolean>;
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
  const [products, setProductsState] = useState<Product[]>([]);

  useEffect(() => {
    function toProduct(raw: Record<string, unknown>): Product {
      return {
        ...raw,
        id: String(raw._id ?? raw.id ?? ''),
        price: Number(raw.price),
        originalPrice: raw.originalPrice != null ? Number(raw.originalPrice) : undefined,
        image: raw.image != null ? String(raw.image) : '',
        images: Array.isArray(raw.images) ? (raw.images as string[]) : undefined,
      } as Product;
    }

    async function fetchProducts() {
      try {
        const res = await productApi.list({ limit: 1000 });
        if (!res || typeof res !== 'object') return;
        const resObj = res as Record<string, unknown>;
        let rawList: unknown[] | null = null;
        if (Array.isArray(resObj.products)) rawList = resObj.products as unknown[];
        else if (Array.isArray(resObj.items)) rawList = resObj.items as unknown[];
        else if (Array.isArray(res)) rawList = res as unknown[];
        if (!rawList) return;
        setProductsState(rawList.map((p) => toProduct(p as Record<string, unknown>)));
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.banner, JSON.stringify(banner));
  }, [banner]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.hero, JSON.stringify(hero));
  }, [hero]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.headings, JSON.stringify(headings));
  }, [headings]);
  const setBanner = useCallback((b: BannerContent) => setBannerState(b), []);
  const setHero = useCallback((h: HeroContent) => setHeroState(h), []);
  const setHeadings = useCallback((h: HeadingsContent) => setHeadingsState(h), []);

  const setProducts = useCallback((p: Product[]) => setProductsState(p), []);

  const addProduct = useCallback(async (product: Product): Promise<boolean> => {
    try {
      const { id, quantity, ...rest } = product;
      const qty = quantity || 0;
      
      // Use Admin API to create product with stock
      const res = await adminApi.createProduct({ 
        product: rest as Record<string, unknown>, 
        quantity: qty 
      });

      if (res && (res as any).success !== false) {
         const createdId = (res as any).data?.product?._id || (res as any).data?._id || (res as any).id || 'new-id';
         const newProduct = { ...product, id: createdId };
         setProductsState(prev => [...prev, newProduct]);
         toast.success('Product created successfully');
         return true;
      }
      return false;
    } catch (error: any) {
      console.error('Failed to create product:', error);
      const msg = error?.message || 'Failed to create product';
      toast.error(msg);
      return false;
    }
  }, []);

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>): Promise<boolean> => {
      try {
        const { quantity, ...productUpdates } = updates;
        
        // Use Admin API to update product and/or stock
        await adminApi.updateProduct(id, { 
          product: Object.keys(productUpdates).length > 0 ? productUpdates as Record<string, unknown> : undefined,
          quantity: quantity
        });

        setProductsState((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
        toast.success('Product updated successfully');
        return true;
      } catch (error: any) {
        console.error('Failed to update product:', error);
        const msg = error?.message || 'Failed to update product';
        toast.error(msg);
        return false;
      }
    },
    []
  );

  const removeProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      await productApi.delete(id);
      setProductsState((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
      return false;
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    setBannerState(DEFAULT_BANNER);
    setHeroState(DEFAULT_HERO);
    setHeadingsState(DEFAULT_HEADINGS);
    // setProductsState(defaultProducts); // Cannot reset products to default as they are from API
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
