import { toast } from 'sonner';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { useCart } from '@/context/CartContext';
import { Product } from '@/data/products';

const Index = () => {
  const { cartCount, openCart, addItem, items, updateQuantity, removeItem, isCartOpen, closeCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cartCount} onCartClick={openCart} />
      <Hero />
      <ProductGrid onAddToCart={handleAddToCart} />
      <Features />
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

export default Index;
