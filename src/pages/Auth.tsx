import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { LogIn, UserPlus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { ApiClientError } from '@/lib/api';

function getAuthErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiClientError) return err.message;
  if (err instanceof Error && (err.message === 'Failed to fetch' || err.message.includes('NetworkError'))) {
    return 'Cannot reach server. Check the backend is running and CORS allows this origin.';
  }
  return fallback;
}

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { login, signup } = useAuth();

  const safeRedirect = redirectTo?.startsWith('/') ? redirectTo : '/';
  const { cartCount, openCart, items, updateQuantity, removeItem, isCartOpen, closeCart } = useCart();

  const redirectWithToast = (message: string) => {
    toast.success(message);
    setTimeout(() => navigate(safeRedirect), 400);
  };

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!loginPassword) {
      toast.error('Please enter your password');
      return;
    }
    setLoading(true);
    try {
      const ok = await login(loginEmail, loginPassword);
      if (ok) {
        redirectWithToast('Login successful! Welcome back.');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (err) {
      toast.error(getAuthErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!signupEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!signupPhone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!signupPassword) {
      toast.error('Please enter a password');
      return;
    }
    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const ok = await signup(signupEmail, signupPassword, signupName.trim(), signupPhone.trim());
      if (ok) {
        redirectWithToast('Registration successful! Welcome to HFD.');
      } else {
        toast.error('Sign up failed. No token received from server.');
      }
    } catch (err) {
      toast.error(getAuthErrorMessage(err, 'Sign up failed. Please try again.'));
    } finally {
      setLoading(false);
    }
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
                  <BreadcrumbPage className="font-medium text-foreground">
                    Login / Sign up
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="max-w-md mx-auto">
            <h1
              className="text-3xl font-bold text-foreground text-center mb-2"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Welcome to HFD
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Sign in to your account or create a new one
            </p>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted rounded-xl mb-6">
                <TabsTrigger
                  value="login"
                  className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <form
                  onSubmit={handleLogin}
                  className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-5 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      autoComplete="email"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      autoComplete="current-password"
                      className="h-11"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Button type="submit" size="lg" className="w-full h-11" disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form
                  onSubmit={handleSignup}
                  className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-5 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      autoComplete="name"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      autoComplete="email"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="e.g. 9820550527"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      autoComplete="tel"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      autoComplete="new-password"
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full h-11" disabled={loading}>
                    {loading ? 'Creating account…' : 'Create account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-center text-sm text-muted-foreground mt-6">
              By continuing, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
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
};

export default Auth;
