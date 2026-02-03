import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Image as ImageIcon,
  Megaphone,
  Type,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Save,
  RotateCcw,
  Upload,
  X,
  Search,
  Store,
  Layout,
  ExternalLink,
} from 'lucide-react';
import { useSiteContent } from '@/context/SiteContentContext';
import type { Product } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { categories } from '@/data/products';
import type { HeroContent, BannerContent, HeadingsContent } from '@/context/SiteContentContext';

type PageId = 'products' | 'theme';

const PAGE_TITLES: Record<PageId, string> = {
  products: 'Products',
  theme: 'Theme',
};

const DEFAULT_RESET: { banner: BannerContent; hero: HeroContent; headings: HeadingsContent } = {
  banner: { text: '✨ Free Shipping on orders above ₹2,999 | Use code ETHNIC20 for 20% off ✨' },
  hero: {
    badge: '✨ New Wedding Collection 2024',
    headlineLine1: 'Celebrate Your',
    headlineLine2: 'Indian Heritage',
    description: 'Discover exquisite ethnic wear handcrafted with love. From traditional sarees to contemporary lehengas, find your perfect festive outfit.',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=750&fit=crop',
    ctaPrimary: 'Shop Collection',
    ctaSecondary: 'View Lookbook',
    trendingLabel: '🔥 Trending Now',
    trendingSubtext: 'Bridal Lehengas',
  },
  headings: {
    bestsellingTitle: 'Bestselling Collection',
    bestsellingSubtitle: 'Our most loved pieces chosen by thousands of happy customers',
    categoriesTitle: 'Shop by Category',
    categoriesSubtitle: 'Explore our curated collection of traditional and contemporary Indian wear',
  },
};

function getCategoryName(categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.name ?? categoryId;
}

function matchesSearch(product: Product, query: string): boolean {
  const q = query.toLowerCase();
  return (
    product.name.toLowerCase().includes(q) ||
    getCategoryName(product.category).toLowerCase().includes(q)
  );
}

function ProductPreviewCard({ form }: { form: Partial<Product> }) {
  const price = Number(form.price) || 0;
  const originalPrice = form.originalPrice ? Number(form.originalPrice) : 0;
  const hasDiscount = originalPrice > 0 && originalPrice > price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div
      className="w-full max-w-[200px] rounded-[var(--admin-radius)] overflow-hidden border bg-white"
      style={{ borderColor: 'var(--admin-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      <div className="aspect-[3/4] bg-muted relative">
        <img
          src={form.image || 'https://placehold.co/400x500?text=Image'}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {form.isNew && (
            <span className="px-2 py-0.5 rounded text-xs bg-accent text-accent-foreground">New</span>
          )}
          {form.isBestseller && (
            <span className="px-2 py-0.5 rounded text-xs bg-secondary text-secondary-foreground">Bestseller</span>
          )}
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded text-xs bg-primary text-primary-foreground">-{discountPercent}%</span>
          )}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium truncate text-foreground">{form.name || 'Product name'}</h3>
        <div className="flex gap-2">
          <span className="font-bold text-primary">₹{price.toLocaleString()}</span>
          {originalPrice > 0 && (
            <span className="text-sm text-muted-foreground line-through">₹{originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const {
    banner,
    hero,
    headings,
    products,
    setBanner,
    setHero,
    setHeadings,
    addProduct,
    updateProduct,
    removeProduct,
    resetToDefaults,
  } = useSiteContent();

  const [page, setPage] = useState<PageId>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerDraft, setBannerDraft] = useState(banner);
  const [heroDraft, setHeroDraft] = useState(hero);
  const [headingsDraft, setHeadingsDraft] = useState(headings);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const filteredProducts = searchQuery.trim()
    ? products.filter((p) => matchesSearch(p, searchQuery))
    : products;

  const saveBanner = () => { setBanner(bannerDraft); toast.success('Banner saved'); };
  const saveHero = () => { setHero(heroDraft); toast.success('Hero saved'); };
  const saveHeadings = () => { setHeadings(headingsDraft); toast.success('Headings saved'); };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setProductForm((p) => ({ ...p, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSizeToggle = (size: string) => {
    const current = productForm.sizes ?? [];
    const selected = current.includes(size);
    const next = selected ? current.filter((s) => s !== size) : [...current, size];
    setProductForm((p) => ({ ...p, sizes: next }));
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: 0, image: '', category: 'sarees', description: '', sizes: [] });
    setProductDialogOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({ ...product });
    setProductDialogOpen(true);
  };

  const saveProduct = () => {
    if (!productForm.name || !productForm.image || !productForm.category) {
      toast.error('Name, image, and category are required');
      return;
    }
    const price = Number(productForm.price) || 0;
    if (price < 0) {
      toast.error('Price must be positive');
      return;
    }
    const originalPrice = productForm.originalPrice ? Number(productForm.originalPrice) : undefined;
    const payload: Omit<Product, 'id'> & { id?: string } = {
      name: productForm.name,
      price,
      originalPrice,
      image: productForm.image,
      category: productForm.category,
      isNew: productForm.isNew ?? false,
      isBestseller: productForm.isBestseller ?? false,
      description: productForm.description || undefined,
      sizes: productForm.sizes?.length ? productForm.sizes : undefined,
    };
    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      toast.success('Product updated');
    } else {
      addProduct({ ...payload, id: '' } as Product);
      toast.success('Product added');
    }
    setProductDialogOpen(false);
  };

  const confirmDeleteProduct = (id: string) => setDeleteProductId(id);

  const doDeleteProduct = () => {
    if (!deleteProductId) return;
    removeProduct(deleteProductId);
    toast.success('Product removed');
    setDeleteProductId(null);
  };

  const handleReset = () => {
    resetToDefaults();
    setBannerDraft(DEFAULT_RESET.banner);
    setHeroDraft(DEFAULT_RESET.hero);
    setHeadingsDraft(DEFAULT_RESET.headings);
    toast.success('Reset to defaults');
  };

  const navItems: { id: PageId; label: string; icon: typeof Package }[] = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'theme', label: 'Theme', icon: Layout },
  ];

  return (
    <>
    <div className="admin-dashboard min-h-screen flex bg-[var(--admin-bg)]">
      {/* Sidebar */}
      <aside className="w-[240px] shrink-0 flex flex-col border-r bg-[var(--admin-surface)]" style={{ borderColor: 'var(--admin-border)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--admin-border)' }}>
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-base font-semibold" style={{ color: 'var(--admin-text)' }}>HFD Admin</span>
            <ExternalLink className="h-3.5 w-3.5" style={{ color: 'var(--admin-text-subdued)' }} />
          </Link>
        </div>
        <nav className="flex-1 p-3">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--admin-radius)] text-sm font-medium transition-colors ${
                page === id ? 'bg-[var(--admin-accent-bg)]' : 'hover:bg-[var(--admin-bg)]'
              }`}
              style={{ color: page === id ? 'var(--admin-accent)' : 'var(--admin-text)' }}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-80" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <button
            onClick={handleReset}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--admin-radius)] text-sm text-left transition-colors hover:bg-[var(--admin-bg)]"
            style={{ color: 'var(--admin-text-subdued)' }}
          >
            <RotateCcw className="h-5 w-5 shrink-0" />
            Reset defaults
          </button>
          <Link
            to="/"
            className="mt-1 flex items-center gap-3 px-3 py-2.5 rounded-[var(--admin-radius)] text-sm no-underline transition-colors hover:bg-[var(--admin-bg)]"
            style={{ color: 'var(--admin-text)' }}
          >
            <Store className="h-5 w-5 shrink-0" />
            Back to store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="shrink-0 h-14 px-6 flex items-center justify-between border-b bg-[var(--admin-surface)]" style={{ borderColor: 'var(--admin-border)' }}>
          <h1 className="text-base font-semibold" style={{ color: 'var(--admin-text)' }}>
            {PAGE_TITLES[page]}
          </h1>
          {page === 'products' && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--admin-text-subdued)' }} />
              <Input
                placeholder="Search products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm rounded-[var(--admin-radius)] border-[var(--admin-border)] bg-[var(--admin-bg)]"
              />
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {page === 'products' && (
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm" style={{ color: 'var(--admin-text-subdued)' }}>
                  {products.length} products
                </p>
                <Button
                  onClick={openAddProduct}
                  className="rounded-[var(--admin-radius)] h-9 px-4 text-sm font-medium"
                  style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add product
                </Button>
              </div>

              <div className="border rounded-[var(--admin-radius)] overflow-hidden bg-[var(--admin-surface)]" style={{ borderColor: 'var(--admin-border)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
                      <th className="px-4 py-3 font-medium" style={{ color: 'var(--admin-text-subdued)' }}>Product</th>
                      <th className="px-4 py-3 font-medium" style={{ color: 'var(--admin-text-subdued)' }}>Category</th>
                      <th className="px-4 py-3 font-medium" style={{ color: 'var(--admin-text-subdued)' }}>Price</th>
                      <th className="px-4 py-3 w-24" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b last:border-0 hover:bg-[var(--admin-bg)]/50 transition-colors" style={{ borderColor: 'var(--admin-border)' }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={product.image} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                            <span className="font-medium" style={{ color: 'var(--admin-text)' }}>{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--admin-text-subdued)' }}>
                          {getCategoryName(product.category)}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--admin-text)' }}>₹{product.price}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditProduct(product)}>
                              <Pencil className="h-4 w-4" style={{ color: 'var(--admin-text-subdued)' }} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[var(--admin-critical-bg)]" onClick={() => confirmDeleteProduct(product.id)}>
                              <Trash2 className="h-4 w-4" style={{ color: 'var(--admin-critical)' }} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {page === 'theme' && (
            <div className="max-w-2xl space-y-8">
              {/* Hero */}
              <section className="border rounded-[var(--admin-radius)] p-5 bg-[var(--admin-surface)]" style={{ borderColor: 'var(--admin-border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="h-5 w-5" style={{ color: 'var(--admin-text-subdued)' }} />
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>Hero section</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Badge</Label>
                    <Input value={heroDraft.badge} onChange={(e) => setHeroDraft((h) => ({ ...h, badge: e.target.value }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Headline 1</Label>
                      <Input value={heroDraft.headlineLine1} onChange={(e) => setHeroDraft((h) => ({ ...h, headlineLine1: e.target.value }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Headline 2</Label>
                      <Input value={heroDraft.headlineLine2} onChange={(e) => setHeroDraft((h) => ({ ...h, headlineLine2: e.target.value }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Description</Label>
                    <Textarea value={heroDraft.description} onChange={(e) => setHeroDraft((h) => ({ ...h, description: e.target.value }))} rows={2} className="rounded-[var(--admin-radius)] border-[var(--admin-border)] resize-none" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Image URL</Label>
                    <Input value={heroDraft.imageUrl} onChange={(e) => setHeroDraft((h) => ({ ...h, imageUrl: e.target.value }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Primary CTA</Label>
                      <Input value={heroDraft.ctaPrimary} onChange={(e) => setHeroDraft((h) => ({ ...h, ctaPrimary: e.target.value }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Secondary CTA</Label>
                      <Input value={heroDraft.ctaSecondary} onChange={(e) => setHeroDraft((h) => ({ ...h, ctaSecondary: e.target.value }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Trending label</Label>
                      <Input value={heroDraft.trendingLabel} onChange={(e) => setHeroDraft((h) => ({ ...h, trendingLabel: e.target.value }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Trending subtext</Label>
                      <Input value={heroDraft.trendingSubtext} onChange={(e) => setHeroDraft((h) => ({ ...h, trendingSubtext: e.target.value }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" />
                    </div>
                  </div>
                  <Button onClick={saveHero} size="sm" className="rounded-[var(--admin-radius)]" style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}>
                    <Save className="h-4 w-4 mr-2" /> Save hero
                  </Button>
                </div>
              </section>

              {/* Banner */}
              <section className="border rounded-[var(--admin-radius)] p-5 bg-[var(--admin-surface)]" style={{ borderColor: 'var(--admin-border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Megaphone className="h-5 w-5" style={{ color: 'var(--admin-text-subdued)' }} />
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>Top banner</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Banner text</Label>
                    <Input value={bannerDraft.text} onChange={(e) => setBannerDraft((b) => ({ ...b, text: e.target.value }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" placeholder="e.g. Free shipping on orders above ₹2,999" />
                  </div>
                  <div className="p-3 rounded-[var(--admin-radius)] text-sm" style={{ backgroundColor: 'var(--admin-accent-bg)', color: 'var(--admin-accent)' }}>
                    Preview: {bannerDraft.text || '(empty)'}
                  </div>
                  <Button onClick={saveBanner} size="sm" className="rounded-[var(--admin-radius)]" style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}>
                    <Save className="h-4 w-4 mr-2" /> Save banner
                  </Button>
                </div>
              </section>

              {/* Headings */}
              <section className="border rounded-[var(--admin-radius)] p-5 bg-[var(--admin-surface)]" style={{ borderColor: 'var(--admin-border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Type className="h-5 w-5" style={{ color: 'var(--admin-text-subdued)' }} />
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>Section headings</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Bestselling title</Label>
                    <Input value={headingsDraft.bestsellingTitle} onChange={(e) => setHeadingsDraft((h) => ({ ...h, bestsellingTitle: e.target.value }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Bestselling subtitle</Label>
                    <Input value={headingsDraft.bestsellingSubtitle} onChange={(e) => setHeadingsDraft((h) => ({ ...h, bestsellingSubtitle: e.target.value }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Categories title</Label>
                    <Input value={headingsDraft.categoriesTitle} onChange={(e) => setHeadingsDraft((h) => ({ ...h, categoriesTitle: e.target.value }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Categories subtitle</Label>
                    <Input value={headingsDraft.categoriesSubtitle} onChange={(e) => setHeadingsDraft((h) => ({ ...h, categoriesSubtitle: e.target.value }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" />
                  </div>
                  <Button onClick={saveHeadings} size="sm" className="rounded-[var(--admin-radius)]" style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}>
                    <Save className="h-4 w-4 mr-2" /> Save headings
                  </Button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>

    {/* Product dialog */}
    <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
      <DialogContent className="admin-dashboard max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0 rounded-[var(--admin-radius)] border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <DialogHeader className="px-6 py-4 border-b pr-12" style={{ borderColor: 'var(--admin-border)' }}>
          <DialogTitle className="text-base font-semibold" style={{ color: 'var(--admin-text)' }}>
            {editingProduct ? 'Edit product' : 'Add product'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-0">
          <div className="overflow-y-auto px-6 py-4 space-y-4 border-r md:border-r" style={{ borderColor: 'var(--admin-border)' }}>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Name</Label>
              <Input value={productForm.name ?? ''} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" placeholder="Product name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Price (₹)</Label>
                <Input type="number" min={0} value={productForm.price ?? ''} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Original price (₹)</Label>
                <Input type="number" min={0} value={productForm.originalPrice ?? ''} onChange={(e) => setProductForm((p) => ({ ...p, originalPrice: e.target.value || undefined }))} className="rounded-[var(--admin-radius)] border-[var(--admin-border)]" placeholder="Optional" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageSelect(file);
                  e.target.value = '';
                }}
              />
              {productForm.image ? (
                <div className="relative rounded-[var(--admin-radius)] overflow-hidden border" style={{ borderColor: 'var(--admin-border)' }}>
                  <img src={productForm.image} alt="" className="w-full h-36 object-cover" />
                  <button
                    type="button"
                    onClick={() => setProductForm((p) => ({ ...p, image: '' }))}
                    className="absolute top-2 right-2 p-1.5 rounded bg-white border shadow-sm"
                    style={{ borderColor: 'var(--admin-border)' }}
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--admin-accent)';
                  }}
                  onDragLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).style.borderColor = '';
                    const file = e.dataTransfer.files[0];
                    if (file?.type.startsWith('image/')) handleImageSelect(file);
                  }}
                  className="w-full py-8 flex flex-col items-center justify-center gap-2 rounded-[var(--admin-radius)] border-2 border-dashed transition-colors hover:border-[var(--admin-accent)]"
                  style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-subdued)' }}
                >
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Click or drop image</span>
                </button>
              )}
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Description</Label>
              <Textarea value={productForm.description ?? ''} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="rounded-[var(--admin-radius)] border-[var(--admin-border)] resize-none" />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {['One Size', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                  const isSelected = (productForm.sizes ?? []).includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`px-3 py-1.5 text-sm rounded border ${isSelected ? 'border-[var(--admin-accent)] bg-[var(--admin-accent-bg)]' : ''}`}
                      style={isSelected ? { color: 'var(--admin-accent)' } : { borderColor: 'var(--admin-border)', color: 'var(--admin-text-subdued)' }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--admin-text-subdued)' }}>Category</Label>
              <Select value={productForm.category ?? 'sarees'} onValueChange={(v) => setProductForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger className="rounded-[var(--admin-radius)] border-[var(--admin-border)]"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-[var(--admin-radius)] border-[var(--admin-border)]">
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--admin-text)' }}><input type="checkbox" checked={productForm.isNew ?? false} onChange={(e) => setProductForm((p) => ({ ...p, isNew: e.target.checked }))} className="rounded" style={{ accentColor: 'var(--admin-accent)' }} /> New</label>
              <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--admin-text)' }}><input type="checkbox" checked={productForm.isBestseller ?? false} onChange={(e) => setProductForm((p) => ({ ...p, isBestseller: e.target.checked }))} className="rounded" style={{ accentColor: 'var(--admin-accent)' }} /> Bestseller</label>
            </div>
          </div>
          <div className="p-6 flex flex-col bg-[var(--admin-bg)]">
            <p className="text-xs font-medium mb-3" style={{ color: 'var(--admin-text-subdued)' }}>Preview</p>
            <div className="flex justify-center">
              <ProductPreviewCard form={productForm} />
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <Button variant="outline" onClick={() => setProductDialogOpen(false)} size="sm" className="rounded-[var(--admin-radius)] border-[var(--admin-border)]">Cancel</Button>
          <Button onClick={saveProduct} size="sm" className="rounded-[var(--admin-radius)]" style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={!!deleteProductId} onOpenChange={(o) => !o && setDeleteProductId(null)}>
      <AlertDialogContent className="admin-dashboard rounded-[var(--admin-radius)] border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <AlertDialogHeader>
          <AlertDialogTitle style={{ color: 'var(--admin-text)' }}>Remove product?</AlertDialogTitle>
          <AlertDialogDescription style={{ color: 'var(--admin-text-subdued)' }}>This will remove the product from your catalog.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-[var(--admin-radius)] border-[var(--admin-border)]">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={doDeleteProduct} className="rounded-[var(--admin-radius)] bg-[var(--admin-critical)] hover:opacity-90 text-white">Remove</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
</>
  );
}
