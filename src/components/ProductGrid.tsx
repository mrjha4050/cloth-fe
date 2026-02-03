import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import { Product } from '@/data/products';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { useSiteContent } from '@/context/SiteContentContext';

const STAGGER_STEP_MS = 60;
const STAGGER_MAX_MS = 400;

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
  const { products, headings } = useSiteContent();
  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div className="text-center sm:text-left">
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {headings.bestsellingTitle}
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              {headings.bestsellingSubtitle}
            </p>
          </div>
          <div className="flex justify-center sm:justify-end shrink-0">
            <Button
              variant="outline"
              size="lg"
              className="group border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 font-medium"
              asChild
            >
              <Link to="/products" className="inline-flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Show more products
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${Math.min(index * STAGGER_STEP_MS, STAGGER_MAX_MS)}ms` }}
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>

        <div
          className="mt-12 flex justify-center opacity-0 animate-fade-in-up"
          style={{ animationDelay: '420ms', animationFillMode: 'forwards' }}
        >
          <Button
            variant="default"
            size="lg"
            className="group min-w-[200px] h-12 text-base shadow-md shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            asChild
          >
            <Link to="/products" className="inline-flex items-center gap-2">
              View full collection
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
