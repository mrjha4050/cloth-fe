import { createContext } from 'react';
import type { Product } from '@/data/products';

export interface CartItem extends Product {
  quantity: number;
  itemId?: string;
}

export interface CartContextValue {
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
