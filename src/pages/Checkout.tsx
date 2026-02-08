import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CreditCard, Smartphone, Banknote, ChevronRight, ShoppingBag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useCart } from '@/context/useCart';
import { useAuth } from '@/context/AuthContext';
import { orders as ordersApi, auth as authApi, ApiClientError, settings as settingsApi } from '@/lib/api';
import { getProfile } from '@/lib/profile';
import { cn } from '@/lib/utils';

const SHIPPING_FREE_THRESHOLD = 2999;

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { items, cartCount, updateQuantity, removeItem, clearCart, isCartOpen, closeCart, openCart } = useCart();

  const [shippingCost, setShippingCost] = useState<number>(99);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('cod');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : shippingCost;
  const total = subtotal + shipping;

  useEffect(() => {
    settingsApi
      .get()
      .then((res) => {
        if (res?.shippingCost != null && Number.isFinite(Number(res.shippingCost))) {
          setShippingCost(Number(res.shippingCost));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to place your order');
      navigate('/auth?redirect=/checkout', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    let cancelled = false;
    authApi
      .profile()
      .then((profile) => {
        if (cancelled || !profile) return;
        setForm((prev) => ({
          ...prev,
          fullName: prev.fullName || profile.fullName || profile.name || user.name || '',
          email: user.email,
          phone: prev.phone || profile.phone || '',
          addressLine1: prev.addressLine1 || profile.addressLine1 || (profile.address as string) || '',
          addressLine2: prev.addressLine2 || profile.addressLine2 || '',
          city: prev.city || profile.city || '',
          state: prev.state || profile.state || '',
          pincode: prev.pincode || profile.pincode || '',
        }));
      })
      .catch(() => {
        if (cancelled) return;
        const local = getProfile(user.email);
        setForm((prev) => ({
          ...prev,
          fullName: prev.fullName || local?.fullName || user.name || '',
          email: user.email,
          phone: prev.phone || local?.phone || '',
          addressLine1: prev.addressLine1 || local?.addressLine1 || '',
          addressLine2: prev.addressLine2 || local?.addressLine2 || '',
          city: prev.city || local?.city || '',
          state: prev.state || local?.state || '',
          pincode: prev.pincode || local?.pincode || '',
        }));
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.email, user?.name]);

  if (!isAuthenticated) {
    return null;
  }

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!form.fullName.trim() || !form.email.trim() || !form.addressLine1.trim() || !form.pincode.trim()) {
      toast.error('Please fill in required fields: name, email, address, and pincode');
      return;
    }
    setIsSubmitting(true);
    const shippingAddress = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim() || undefined,
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
    };
    try {
      await ordersApi.create({
        shippingAddress,
        paymentMethod,
        shipping,
      });
      try {
        await authApi.updateProfile({
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
        });
      } catch {
        // Profile save is best-effort; order already placed
      }
      clearCart();
      toast.success('Order placed successfully! We’ll send a confirmation to your email.');
      navigate('/orders');
    } catch (err) {
      const message =
        err instanceof ApiClientError && err.message
          ? err.message
          : 'Could not place order. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header cartCount={cartCount} onCartClick={openCart} />
        <main className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-16">
          <ShoppingBag className="h-20 w-20 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
            Your cart is empty
          </h1>
          <p className="text-muted-foreground text-center max-w-sm">
            Add something beautiful from our collection before checkout.
          </p>
          <Button asChild size="lg">
            <Link to="/">Continue Shopping</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

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
                  <BreadcrumbPage className="font-medium text-foreground">Checkout</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Left: Shipping & Payment */}
            <div className="lg:col-span-3 space-y-10">
              {/* Shipping address */}
              <section
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
              >
                <h2 className="text-xl font-bold text-foreground mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Shipping address
                </h2>
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full name *</Label>
                      <Input
                        id="fullName"
                        value={form.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address line 1 *</Label>
                    <Input
                      id="addressLine1"
                      value={form.addressLine1}
                      onChange={(e) => updateField('addressLine1', e.target.value)}
                      placeholder="Street, building, flat no."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address line 2</Label>
                    <Input
                      id="addressLine2"
                      value={form.addressLine2}
                      onChange={(e) => updateField('addressLine2', e.target.value)}
                      placeholder="Landmark, area (optional)"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={form.state}
                        onChange={(e) => updateField('state', e.target.value)}
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={form.pincode}
                        onChange={(e) => updateField('pincode', e.target.value)}
                        placeholder="Pincode"
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment method */}
              <section
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: '80ms', animationFillMode: 'forwards' }}
              >
                <h2 className="text-xl font-bold text-foreground mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Payment method
                </h2>
                <div className="rounded-xl border border-border bg-card p-6">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as 'card' | 'upi' | 'cod')}
                    className="grid gap-4"
                  >
                    <label
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors',
                        paymentMethod === 'card'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      )}
                    >
                      <RadioGroupItem value="card" id="pay-card" />
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Card (Credit / Debit)</span>
                    </label>
                    <label
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors',
                        paymentMethod === 'upi'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      )}
                    >
                      <RadioGroupItem value="upi" id="pay-upi" />
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">UPI</span>
                    </label>
                    <label
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors',
                        paymentMethod === 'cod'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      )}
                    >
                      <RadioGroupItem value="cod" id="pay-cod" />
                      <Banknote className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Cash on Delivery (COD)</span>
                    </label>
                  </RadioGroup>
                </div>
              </section>
            </div>

            {/* Right: Order summary (sticky) */}
            <div
              className="lg:col-span-2 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '120ms', animationFillMode: 'forwards' }}
            >
              <div className="lg:sticky lg:top-24 rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Order summary
                  </h2>
                </div>
                <div className="p-6 space-y-4 max-h-[320px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-20 object-cover rounded-md shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                        <p className="text-muted-foreground text-sm">
                          Qty {item.quantity} × ₹{item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-medium text-foreground shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-border space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-accent">Free</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>
                  {subtotal < SHIPPING_FREE_THRESHOLD && (
                    <p className="text-xs text-muted-foreground">
                      Free shipping on orders above ₹{SHIPPING_FREE_THRESHOLD.toLocaleString()}
                    </p>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">₹{total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Placing order…' : 'Place order'}
                  </Button>
                  <Button variant="ghost" className="w-full mt-2" asChild>
                    <Link to="/">
                      <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                      Continue shopping
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
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

export default Checkout;
