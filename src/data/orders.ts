export interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus = 'confirmed' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
}

const STORAGE_KEY = 'hfd_orders';

function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStoredOrders(orders: Order[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

export function getOrders(): Order[] {
  return getStoredOrders().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
  const orders = getStoredOrders();
  const id = `HFD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const createdAt = new Date().toISOString();
  const newOrder: Order = { ...order, id, createdAt };
  orders.unshift(newOrder);
  setStoredOrders(orders);
  return newOrder;
}

export function getOrderById(id: string): Order | undefined {
  return getStoredOrders().find((o) => o.id === id);
}
