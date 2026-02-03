import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getProfile, setProfile, type ProfileData } from '@/lib/profile';

const emptyProfile: ProfileData = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
};

function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { cartCount, openCart, items, updateQuantity, removeItem, isCartOpen, closeCart } = useCart();

  const [form, setForm] = useState<ProfileData>(emptyProfile);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to view your profile');
      navigate('/auth?redirect=/profile', { replace: true });
      return;
    }
    if (user) {
      const saved = getProfile(user.email);
      setForm({
        fullName: saved?.fullName ?? user.name ?? '',
        phone: saved?.phone ?? '',
        addressLine1: saved?.addressLine1 ?? '',
        addressLine2: saved?.addressLine2 ?? '',
        city: saved?.city ?? '',
        state: saved?.state ?? '',
        pincode: saved?.pincode ?? '',
      });
    }
  }, [isAuthenticated, user?.email, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const updateField = (field: keyof ProfileData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfile(user.email, form);
    toast.success('Profile updated successfully');
    setIsSaving(false);
  };

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
                  <BreadcrumbPage className="font-medium text-foreground">Profile</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="max-w-xl mx-auto">
            <header className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserCircle className="h-8 w-8" />
              </div>
              <div>
                <h1
                  className="text-2xl md:text-3xl font-bold text-foreground"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  My Profile
                </h1>
                <p className="text-muted-foreground text-sm">Manage your contact and address details</p>
              </div>
            </header>

            <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-fullName">Full name</Label>
                  <Input
                    id="profile-fullName"
                    value={form.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Your name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={user.email}
                    readOnly
                    disabled
                    className="h-11 bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="10-digit mobile number"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-addressLine1">Address line 1</Label>
                <Input
                  id="profile-addressLine1"
                  value={form.addressLine1}
                  onChange={(e) => updateField('addressLine1', e.target.value)}
                  placeholder="Street, building, flat no."
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-addressLine2">Address line 2</Label>
                <Input
                  id="profile-addressLine2"
                  value={form.addressLine2}
                  onChange={(e) => updateField('addressLine2', e.target.value)}
                  placeholder="Landmark, area (optional)"
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-city">City</Label>
                  <Input
                    id="profile-city"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="City"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-state">State</Label>
                  <Input
                    id="profile-state"
                    value={form.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    placeholder="State"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-pincode">Pincode</Label>
                  <Input
                    id="profile-pincode"
                    value={form.pincode}
                    onChange={(e) => updateField('pincode', e.target.value)}
                    placeholder="Pincode"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" size="lg" disabled={isSaving} className="sm:w-auto">
                  {isSaving ? 'Saving…' : 'Save changes'}
                </Button>
                <Button type="button" variant="outline" size="lg" asChild className="sm:w-auto">
                  <Link to="/">Cancel</Link>
                </Button>
              </div>
            </form>
          </div>
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
}

export default Profile;
