import {
  createContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { Product } from '@/data/products';
import { useAuth } from '@/context/AuthContext';
import { useSiteContent } from '@/context/SiteContentContext';
import { cart as cartApi } from '@/lib/api';
import { toast } from 'sonner';

export interface CartItem extends Product {
  quantity: number;
  /** Backend cart line id for update/remove when authenticated */
  itemId?: string;
}

interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

/** Normalized row: product id, quantity, optional line id (backend cart model may use different names). */
type CartRow = { productId: string; quantity: number; itemId?: string };

function extractItemsArray(res: unknown): unknown[] | null {
  if (res == null) return null;
  if (Array.isArray(res)) return res;
  const obj = res as Record<string, unknown>;
  if (obj.cart != null) {
    const cart = obj.cart as Record<string, unknown> | unknown[];
    if (Array.isArray(cart)) return cart;
    if (typeof cart === 'object' && cart !== null) {
      const arr = (cart as Record<string, unknown>).items ?? (cart as Record<string, unknown>).lines;
      if (Array.isArray(arr)) return arr;
    }
  }
  if (Array.isArray(obj.items)) return obj.items;
  if (Array.isArray(obj.data)) return obj.data;
  const keys = Object.keys(obj);
  if (keys.length > 0 && keys.every((k) => /^\d+$/.test(k))) return Object.values(obj);
  return null;
}

function parseCartResponse(res: unknown): CartRow[] {
  const arr = extractItemsArray(res);
  return arr ? normalizeCartRows(arr) : [];
}

function getLineId(row: Record<string, unknown>): string | undefined {
  if (typeof row.itemId === 'string') return row.itemId;
  if (typeof row.item_id === 'string') return row.item_id;
  if (typeof row.id === 'string') return row.id;
  return undefined;
}

function normalizeCartRows(maybeItems: unknown[]): CartRow[] {
  const out: CartRow[] = [];
  for (const r of maybeItems) {
    if (!r || typeof r !== 'object') continue;
    const row = r as Record<string, unknown>;
    const productId =
      typeof row.productId === 'string' ? row.productId : (row.product_id as string | undefined);
    if (typeof productId !== 'string') continue;
    const quantity =
      typeof row.quantity === 'number' ? row.quantity : Number(row.quantity) || 0;
    out.push({ productId, quantity, itemId: getLineId(row) });
  }
  return out;
}

function stubProduct(productId: string): Product {
  return {
    id: productId,
    name: 'Product',
    price: 0,
    image: '',
    category: '',
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { products } = useSiteContent();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await cartApi.get();
      const rawItems = parseCartResponse(res);
      if (import.meta.env.DEV && rawItems.length === 0 && res != null) {
        console.debug('[cart] GET response (parsed 0 items):', res);
      }
      const list: CartItem[] = [];
      for (const row of rawItems) {
        const product = products.find((p) => p.id === row.productId) ?? stubProduct(row.productId);
        list.push({
          ...product,
          quantity: row.quantity,
          itemId: row.itemId,
        });
      }
      setItems(list);
    } catch {
      setItems([]);
    }
  }, [isAuthenticated, products]);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    fetchCart();
  }, [isAuthenticated, fetchCart]);

  const addItem = useCallback(
    async (product: Product, quantity = 1) => {
      if (isAuthenticated) {
        setItems((prev) => {
          const existing = prev.find((item) => item.id === product.id);
          if (existing) {
            return prev.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          }
          return [...prev, { ...product, quantity }];
        });
        try {
          await cartApi.add(product.id, quantity);
          setTimeout(() => fetchCart(), 150);
        } catch {
          toast.error('Could not add to cart');
          fetchCart();
        }
        return;
      }
      setItems((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { ...product, quantity }];
      });
    },
    [isAuthenticated, fetchCart]
  );

  const removeItem = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        const item = items.find((i) => i.id === id);
        if (item?.itemId != null) {
          try {
            await cartApi.remove(item.itemId);
            await fetchCart();
          } catch {
            toast.error('Could not remove item');
            await fetchCart();
          }
          return;
        }
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    [isAuthenticated, items, fetchCart]
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (quantity < 1) {
        await removeItem(id);
        return;
      }
      if (isAuthenticated) {
        const item = items.find((i) => i.id === id);
        if (item?.itemId != null) {
          try {
            await cartApi.update(item.itemId, quantity);
            await fetchCart();
          } catch {
            toast.error('Could not update quantity');
            await fetchCart();
          }
          return;
        }
      }
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    },
    [isAuthenticated, items, fetchCart, removeItem]
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await cartApi.clear();
      } catch {
        toast.error('Could not clear cart');
      }
    }
    setItems([]);
  }, [isAuthenticated]);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextValue = {
    items,
    cartCount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    isCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
