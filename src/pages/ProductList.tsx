import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Layers } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import ProductCard from '@/components/ProductCard';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/useCart';
import { useSiteContent } from '@/context/SiteContentContext';
import type { Product } from '@/data/products';

const STAGGER_STEP_MS = 50;
const STAGGER_MAX_MS = 350;

function ProductList() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { products } = useSiteContent();
  const { cartCount, openCart, addItem, items, updateQuantity, removeItem, isCartOpen, closeCart } = useCart();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to view the full collection');
      navigate('/auth?redirect=/products', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast.success(`${product.name} added to cart!`);
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
                    All Products
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <section className="container mx-auto px-4 py-10 md:py-14">
          <header className="mb-12 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
              <Layers className="h-6 w-6" />
            </div>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 opacity-0 animate-fade-in-up"
              style={{ fontFamily: 'Playfair Display, serif', animationDelay: '40ms', animationFillMode: 'forwards' }}
            >
              Full Collection
            </h1>
            <p
              className="text-muted-foreground text-lg opacity-0 animate-fade-in-up"
              style={{ animationDelay: '80ms', animationFillMode: 'forwards' }}
            >
              Explore our complete range of ethnic wear — handpicked for you.
            </p>
            <div
              className="mt-6 w-16 h-0.5 bg-primary mx-auto rounded-full opacity-0 animate-fade-in-up"
              style={{ animationDelay: '120ms', animationFillMode: 'forwards' }}
              aria-hidden
            />
          </header>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="opacity-0 animate-fade-in-up"
                style={{
                  animationDelay: `${120 + Math.min(index * STAGGER_STEP_MS, STAGGER_MAX_MS)}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No products in the collection yet.</p>
              <Link to="/" className="text-primary font-medium hover:underline mt-2 inline-block">
                Back to home
              </Link>
            </div>
          )}
        </section>
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

export default ProductList;
