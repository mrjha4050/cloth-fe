import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  Package,
  MapPin,
  ShoppingBag,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useCart } from '@/context/useCart';
import { useAuth } from '@/context/AuthContext';
import { orders as ordersApi } from '@/lib/api';
import type { Order, OrderItem, ShippingAddress } from '@/data/orders';
import { cn } from '@/lib/utils';

function mapApiOrderToOrder(raw: Record<string, unknown>): Order {
  const items = (raw.items ?? raw.order_items ?? []) as Record<string, unknown>[];
  const addr = (raw.shippingAddress ?? raw.shipping_address ?? {}) as Record<string, unknown>;
  return {
    id: String(raw.id ?? ''),
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
    status: (raw.status as Order['status']) ?? 'confirmed',
    items: items.map((it) => ({
      id: String(it.id ?? it.product_id ?? it.productId ?? ''),
      name: String(it.name ?? ''),
      image: String(it.image ?? ''),
      price: Number(it.price ?? 0),
      quantity: Number(it.quantity ?? 0),
    })) as OrderItem[],
    shippingAddress: {
      fullName: String(addr.fullName ?? addr.full_name ?? ''),
      email: String(addr.email ?? ''),
      phone: String(addr.phone ?? ''),
      addressLine1: String(addr.addressLine1 ?? addr.address_line1 ?? ''),
      addressLine2: addr.addressLine2 ?? addr.address_line2,
      city: String(addr.city ?? ''),
      state: String(addr.state ?? ''),
      pincode: String(addr.pincode ?? ''),
    } as ShippingAddress,
    subtotal: Number(raw.subtotal ?? 0),
    shipping: Number(raw.shipping ?? 0),
    total: Number(raw.total ?? 0),
    paymentMethod: String(raw.paymentMethod ?? raw.payment_method ?? ''),
  };
}

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const statusVariant =
    order.status === 'delivered'
      ? 'default'
      : order.status === 'shipped'
        ? 'secondary'
        : 'outline';

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 text-left hover:bg-muted/30 transition-colors"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono font-medium text-foreground">
                {order.id}
              </span>
              <Badge variant={statusVariant} className="capitalize">
                {order.status}
              </Badge>
              <span className="text-muted-foreground text-sm">{dateStr}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-primary">
                ₹{order.total.toLocaleString()}
              </span>
              <span className="text-muted-foreground text-sm">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </span>
              {open ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border px-6 py-6 space-y-6 bg-muted/20">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Items
              </h3>
              <ul className="space-y-3">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-4 items-center p-3 rounded-lg bg-card border border-border"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-16 object-cover rounded-md shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Qty {item.quantity} × ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-medium text-foreground shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping address
              </h3>
              <div className="p-4 rounded-lg bg-card border border-border text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.email}</p>
                {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                <p className="mt-2">
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 && (
                    <>, {order.shippingAddress.addressLine2}</>
                  )}
                </p>
                <p>
                  {[order.shippingAddress.city, order.shippingAddress.state]
                    .filter(Boolean)
                    .join(', ')}{' '}
                  {order.shippingAddress.pincode}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm pt-2 border-t border-border">
              <span className="text-muted-foreground">
                Subtotal: <span className="font-medium text-foreground">₹{order.subtotal.toLocaleString()}</span>
              </span>
              <span className="text-muted-foreground">
                Shipping:{' '}
                <span className="font-medium text-foreground">
                  {order.shipping === 0 ? 'Free' : `₹${order.shipping}`}
                </span>
              </span>
              <span className="text-muted-foreground">
                Payment: <span className="font-medium text-foreground capitalize">{order.paymentMethod}</span>
              </span>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const { cartCount, openCart, items, updateQuantity, removeItem, isCartOpen, closeCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await ordersApi.list({ page: 1, limit: 50 });
      const rawList = (res?.items ?? res?.orders ?? []) as Record<string, unknown>[];
      const mapped = rawList.map(mapApiOrderToOrder);
      mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(mapped);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartCount={cartCount} onCartClick={openCart} />

      <main className="flex-1">
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-foreground">
                    My Orders
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1
            className="text-3xl font-bold text-foreground mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            My Orders
          </h1>
          <p className="text-muted-foreground mb-8">
            View and track your order history
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-border bg-card">
              <p className="text-muted-foreground">Loading orders…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-border bg-card">
              <Package className="h-20 w-20 text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                No orders yet
              </h2>
              <p className="text-muted-foreground text-center max-w-sm mb-6">
                When you place an order, it will appear here. Start shopping to see your orders.
              </p>
              <Button asChild size="lg">
                <Link to="/">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Start Shopping
                </Link>
              </Button>
            </div>
          ) : (
            <div
              className="space-y-4 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
            >
              {orders.map((order, index) => (
                <div
                  key={order.id}
                  className="opacity-0 animate-fade-in-up"
                  style={{
                    animationDelay: `${Math.min(index * 60, 200)}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <OrderCard order={order} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <Cart
        isOpen={isCartOpen}
        onClose={closeCart}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
      />
    </div>
  );
};

export default Orders;
