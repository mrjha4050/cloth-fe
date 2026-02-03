import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus,
  MessageCircle,
  Heart,
  Share2,
  Star,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  getProductDetail,
  getCategoryDisplayName,
  type ProductDetail,
} from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useSiteContent } from '@/context/SiteContentContext';
import { cn } from '@/lib/utils';

function StarRating({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <span className="inline-flex items-center gap-0.5 text-secondary" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            i <= full ? 'fill-current' : half && i === full + 1 ? 'fill-current opacity-70' : 'fill-none'
          )}
        />
      ))}
    </span>
  );
}

function RatingBar({ stars, count, maxCount }: { stars: number; count: number; maxCount: number }) {
  const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground text-sm w-12">{stars} stars</span>
      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-secondary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-muted-foreground text-sm w-12 tabular-nums">{count}</span>
    </div>
  );
}

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cartCount, openCart, addItem, items, updateQuantity, removeItem, isCartOpen, closeCart } = useCart();
  const { products } = useSiteContent();

  const baseProduct = products.find((p) => p.id === id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [reviewSort, setReviewSort] = useState('latest');

  if (!baseProduct) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Product not found.</p>
        <Button asChild variant="outline">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  const product = getProductDetail(baseProduct) as ProductDetail;
  const categoryName = getCategoryDisplayName(product.category);
  const maxRatingCount = Math.max(...product.ratingDistribution.map((d) => d.count));

  const handleAddToCart = () => {
    if (product.sizes.length > 1 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addItem(product);
    toast.success(`${product.name} added to cart!`);
    openCart();
  };

  const handleBuyNow = () => {
    if (product.sizes.length > 1 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addItem(product);
    openCart();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartCount={cartCount} onCartClick={openCart} />

      <main className="flex-1">
        {/* Breadcrumb */}
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
                  <BreadcrumbLink asChild>
                    <Link to="/">{categoryName}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-foreground max-w-[12rem] truncate">
                    {product.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Product layout: gallery + info */}
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Gallery */}
            <div
              className="space-y-4 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted border border-border">
                <img
                  src={product.images[selectedImageIndex] ?? product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                />
                {product.isNew && (
                  <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">New</Badge>
                )}
                {product.originalPrice && (
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    className={cn(
                      'shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all',
                      selectedImageIndex === i
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div
              className="space-y-6 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '80ms', animationFillMode: 'forwards' }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
                {product.name}
              </h1>

              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              <button type="button" className="text-primary text-sm font-medium hover:underline">
                Read more
              </button>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  {product.soldCount >= 1000
                    ? `${(product.soldCount / 1000).toFixed(1)}K+ Sold`
                    : `${product.soldCount}+ Sold`}
                </span>
                <span className="flex items-center gap-1.5">
                  <StarRating value={product.rating} size="sm" />
                  <span className="font-medium text-foreground">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Color */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Colour: {product.colors[selectedColorIndex]?.name ?? '—'}
                </p>
                <div className="flex gap-2">
                  {product.colors.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColorIndex(i)}
                      className={cn(
                        'w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center',
                        selectedColorIndex === i
                          ? 'border-foreground ring-2 ring-offset-2 ring-foreground/30'
                          : 'border-border hover:border-muted-foreground/50'
                      )}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                      aria-label={`Colour ${c.name}`}
                    >
                      {selectedColorIndex === i && (
                        <span className="text-white drop-shadow-md text-sm">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Size: {selectedSize ?? 'Select'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={cn(
                        'min-w-[2.75rem] px-4 py-2 rounded-md text-sm font-medium border transition-all',
                        selectedSize === s
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/50 border-border hover:border-muted-foreground/50 text-foreground'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  size="lg"
                  className="flex-1 text-base h-12"
                  onClick={handleAddToCart}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={handleBuyNow}
                >
                  Buy this Item
                </Button>
              </div>

              <div className="flex gap-6 pt-2 text-sm text-muted-foreground">
                <button type="button" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </button>
                <button type="button" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Heart className="h-4 w-4" />
                  Wishlist
                </button>
                <button type="button" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs: Details, Reviews, Discussion */}
        <section
          className="border-t border-border bg-muted/30"
          style={{ animationDelay: '160ms' }}
        >
          <div className="container mx-auto px-4 py-10">
            <Tabs defaultValue="reviews" className="w-full">
              <TabsList className="w-full justify-start h-12 p-0 bg-transparent border-b border-border rounded-none gap-0">
                <TabsTrigger
                  value="details"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 pb-3"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 pb-3"
                >
                  Reviews
                </TabsTrigger>
                <TabsTrigger
                  value="discussion"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 pb-3"
                >
                  Discussion
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-8">
                <div className="prose prose-neutral max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.longDescription || product.description}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <h2 className="text-xl font-semibold text-foreground">Reviews</h2>
                      <p className="text-sm text-muted-foreground">
                        Showing {Math.min(5, product.reviews.length)} from {product.reviewCount} reviews
                      </p>
                    </div>
                    <Select value={reviewSort} onValueChange={setReviewSort}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">Latest</SelectItem>
                        <SelectItem value="highest">Highest rating</SelectItem>
                        <SelectItem value="lowest">Lowest rating</SelectItem>
                      </SelectContent>
                    </Select>

                    <ScrollArea className="h-[400px] pr-4">
                      <ul className="space-y-6">
                        {product.reviews.slice(0, 5).map((review) => (
                          <li key={review.id} className="border-b border-border pb-6 last:border-0">
                            <div className="flex gap-4">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src={review.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {review.author.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="font-medium text-foreground">{review.author}</span>
                                  <StarRating value={review.rating} size="sm" />
                                </div>
                                <p className="text-muted-foreground text-sm mb-3">{review.text}</p>
                                <div className="flex items-center gap-4 text-sm">
                                  <button type="button" className="text-primary hover:underline">
                                    Reply
                                  </button>
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <ThumbsUp className="h-3.5 w-3.5" />
                                    {review.likes}
                                  </span>
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <ThumbsDown className="h-3.5 w-3.5" />
                                    {review.dislikes}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4 p-6 rounded-xl bg-card border border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-foreground">{product.rating}</span>
                        <StarRating value={product.rating} />
                      </div>
                      <div className="space-y-3">
                        {product.ratingDistribution
                          .slice()
                          .reverse()
                          .map(({ stars, count }) => (
                            <RatingBar
                              key={stars}
                              stars={stars}
                              count={count}
                              maxCount={maxRatingCount}
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="discussion" className="mt-8">
                <p className="text-muted-foreground">
                  Community discussion for this product will appear here.
                </p>
              </TabsContent>
            </Tabs>
          </div>
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
};

export default Product;
