import { Product } from '@/data/products';
import ProductCard from './ProductCard';
import { useSiteContent } from '@/context/SiteContentContext';

const STAGGER_STEP_MS = 60;
const STAGGER_MAX_MS = 400;

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
  const { products, headings } = useSiteContent();
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {headings.bestsellingTitle}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {headings.bestsellingSubtitle}
          </p>
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
      </div>
    </section>
  );
}
