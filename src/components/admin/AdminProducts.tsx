import { useState, useRef } from 'react';
import {
  Package,
  Pencil,
  Trash2,
  Plus,
  X,
  Search,
  Upload,
} from 'lucide-react';
import { useSiteContent } from '@/context/SiteContentContext';
import { Product, categories } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { compressImageFile } from '@/lib/imageUtils';
import { uploadProductImage, supabase } from '@/lib/supabase';

const MAX_IMAGES = 5;

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

function productFormImages(form: Partial<Product>): string[] {
  if (form.images?.length) return form.images;
  if (form.image) return [form.image];
  return [];
}

function ProductPreviewCard({ form }: { form: Partial<Product> }) {
  const price = Number(form.price) || 0;
  const originalPrice = form.originalPrice ? Number(form.originalPrice) : 0;
  const hasDiscount = originalPrice > 0 && originalPrice > price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const primaryImage = productFormImages(form)[0];

  return (
    <div
      className="w-full max-w-[180px] sm:max-w-[200px] mx-auto rounded-[var(--admin-radius)] overflow-hidden border bg-white"
      style={{ borderColor: 'var(--admin-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      <div className="aspect-[3/4] bg-muted relative">
        <img
          src={primaryImage || 'https://placehold.co/400x500?text=Image'}
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

export function AdminProducts() {
  const { products, addProduct, updateProduct, removeProduct } = useSiteContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = searchQuery.trim()
    ? products.filter((p) => matchesSearch(p, searchQuery))
    : products;

  const addImages = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;
    const current = productFormImages(productForm);
    const remaining = MAX_IMAGES - current.length;
    if (remaining <= 0) return;
    const toProcess = list.slice(0, remaining);
    try {
      let newUrls: string[];
      if (supabase) {
        newUrls = await Promise.all(
          toProcess.map(async (file) => {
            const url = await uploadProductImage(file);
            if (!url) throw new Error('Upload failed');
            return url;
          })
        );
      } else {
        newUrls = await Promise.all(toProcess.map((file) => compressImageFile(file)));
      }
      setProductForm((p) => {
        const cur = productFormImages(p);
        const combined = cur.concat(newUrls).slice(0, MAX_IMAGES);
        return {
          ...p,
          image: combined[0] ?? p.image ?? '',
          images: combined.length ? combined : undefined,
        };
      });
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error('Image upload failed. Check Supabase bucket and env, or try a smaller file.');
    }
  };

  const removeImageAt = (index: number) => {
    setProductForm((p) => {
      const images = productFormImages(p);
      const next = images.filter((_, i) => i !== index);
      return {
        ...p,
        image: next[0] ?? '',
        images: next.length ? next : undefined,
      };
    });
  };

  const handleSizeToggle = (size: string) => {
    const current = productForm.sizes ?? [];
    const selected = current.includes(size);
    const next = selected ? current.filter((s) => s !== size) : [...current, size];
    setProductForm((p) => ({ ...p, sizes: next }));
  };

  const colorsList = productForm.colors ?? [];
  const addColor = () => {
    setProductForm((p) => ({ ...p, colors: [...(p.colors ?? []), { name: '', hex: '#888888' }] }));
  };
  const updateColor = (index: number, patch: { name?: string; hex?: string }) => {
    setProductForm((p) => {
      const list = p.colors ?? [];
      const next = list.map((c, i) => (i === index ? { ...c, ...patch } : c));
      return { ...p, colors: next };
    });
  };
  const removeColor = (index: number) => {
    setProductForm((p) => ({
      ...p,
      colors: (p.colors ?? []).filter((_, i) => i !== index),
    }));
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: 0, image: '', images: [], category: 'sarees', description: '', sizes: [], colors: [], quantity: 0 });
    setProductDialogOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    let images: string[] = [];
    if (product.images?.length) {
      images = product.images;
    } else if (product.image) {
      images = [product.image];
    }
    setProductForm({ ...product, image: product.image, images });
    setProductDialogOpen(true);
  };

  const saveProduct = async () => {
    const images = productFormImages(productForm);
    if (!productForm.name || images.length === 0 || !productForm.category) {
      toast.error('Name, at least one image, and category are required');
      return;
    }
    const hasDataUrls = images.some((u) => u.startsWith('data:'));
    const payloadSize = images.reduce((acc, u) => acc + u.length, 0);
    if (hasDataUrls && payloadSize > 700_000) {
      toast.error(
        'Images are too large for the server. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local, create a "product-images" bucket in Supabase, then restart the dev server.'
      );
      return;
    }
    const price = Number(productForm.price) || 0;
    if (price < 0) {
      toast.error('Price must be positive');
      return;
    }
    const originalPrice = productForm.originalPrice ? Number(productForm.originalPrice) : undefined;
    const primaryImage = images[0];
    const payload: Omit<Product, 'id'> & { id?: string } = {
      name: productForm.name,
      price,
      originalPrice,
      image: primaryImage,
      images: images.length > 1 ? images : undefined,
      category: productForm.category,
      isNew: productForm.isNew ?? false,
      isBestseller: productForm.isBestseller ?? false,
      description: productForm.description || undefined,
      sizes: productForm.sizes?.length ? productForm.sizes : undefined,
      colors: colorsList.length > 0 ? colorsList.filter((c) => c.name.trim() || c.hex) : undefined,
      quantity: productForm.quantity ? Number(productForm.quantity) : 0,
    };
    
    let success = false;
    if (editingProduct) {
      success = await updateProduct(editingProduct.id, payload);
    } else {
      success = await addProduct({ ...payload, id: '' } as Product);
    }
    
    if (success) {
      setProductDialogOpen(false);
    }
  };

  const confirmDeleteProduct = (id: string) => setDeleteProductId(id);

  function renderImagesField() {
    const imgs = productFormImages(productForm);
    if (imgs.length > 0) {
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {imgs.map((src, i) => (
              <div key={i} className="relative rounded-md overflow-hidden border aspect-square">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImageAt(i)}
                  className="absolute top-1 right-1 p-1 rounded bg-white border shadow-sm hover:bg-muted"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary text-primary-foreground">Primary</span>
                )}
              </div>
            ))}
          </div>
          {imgs.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Add more images
            </button>
          )}
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'hsl(var(--primary))';
        }}
        onDragLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = '';
        }}
        onDrop={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLButtonElement).style.borderColor = '';
          const fileList = e.dataTransfer.files;
          if (fileList?.length) addImages(fileList);
        }}
        className="w-full py-8 flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed transition-colors hover:border-primary text-muted-foreground"
      >
        <Upload className="h-8 w-8" />
        <span className="text-sm">Click or drop images (up to {MAX_IMAGES})</span>
      </button>
    );
  }

  const doDeleteProduct = async () => {
    if (!deleteProductId) return;
    const success = await removeProduct(deleteProductId);
    if (success) {
      setDeleteProductId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
            placeholder="Search products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
           />
        </div>
        <Button onClick={openAddProduct} className="w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add product
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[320px]">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Product</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {getCategoryName(product.category)}
                </td>
                <td className="px-4 py-3">₹{product.price}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditProduct(product)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => confirmDeleteProduct(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
      <DialogContent className="flex flex-col w-[calc(100vw-2rem)] max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden p-0 gap-0 rounded-lg">
        <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b shrink-0">
          <DialogTitle className="text-base sm:text-lg">
            {editingProduct ? 'Edit product' : 'Add product'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {editingProduct ? 'Edit product details and save.' : 'Add a new product with name, price, images, and category.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0 overflow-hidden">
          <div className="overflow-y-auto overflow-x-hidden px-4 py-4 space-y-4 border-b md:border-b-0 md:border-r min-h-0">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Name</Label>
              <Input value={productForm.name ?? ''} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} placeholder="Product name" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Price (₹)</Label>
                <Input type="number" min={0} value={productForm.price ?? ''} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value as unknown as number }))} className="w-full" />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Original price (₹)</Label>
                <Input type="number" min={0} value={productForm.originalPrice ?? ''} onChange={(e) => setProductForm((p) => ({ ...p, originalPrice: e.target.value as unknown as number }))} placeholder="Optional" className="w-full" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs font-medium mb-1.5 block">Stock Quantity</Label>
                <Input type="number" min={0} value={productForm.quantity ?? ''} onChange={(e) => setProductForm((p) => ({ ...p, quantity: e.target.value as unknown as number }))} placeholder="0" className="w-full" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Images (up to {MAX_IMAGES})</Label>
              {!supabase && (
                <p className="text-[11px] text-muted-foreground mb-1">Tip: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local and create bucket &quot;product-images&quot; in Supabase to avoid 413 errors.</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const fileList = e.target.files;
                  if (fileList?.length) {
                    addImages(fileList);
                    e.target.value = '';
                  }
                }}
              />
              {renderImagesField()}
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Description</Label>
              <Textarea value={productForm.description ?? ''} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="resize-none" />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {['One Size', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                  const isSelected = (productForm.sizes ?? []).includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`px-3 py-1.5 text-sm rounded border transition-colors ${isSelected ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Colours</Label>
              <div className="space-y-2">
                {colorsList.map((color, index) => (
                  <div key={index} className="flex items-center gap-2 min-w-0">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => updateColor(index, { hex: e.target.value })}
                      className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded border border-input cursor-pointer p-0.5 bg-background"
                      title="Colour"
                    />
                    <Input
                      placeholder="Colour name"
                      value={color.name}
                      onChange={(e) => updateColor(index, { name: e.target.value })}
                      className="flex-1 min-w-0 h-9"
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeColor(index)} aria-label="Remove colour">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addColor} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add colour
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Category</Label>
              <Select value={productForm.category ?? 'sarees'} onValueChange={(v) => setProductForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium"><input type="checkbox" checked={productForm.isNew ?? false} onChange={(e) => setProductForm((p) => ({ ...p, isNew: e.target.checked }))} className="rounded accent-primary" /> New</label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium"><input type="checkbox" checked={productForm.isBestseller ?? false} onChange={(e) => setProductForm((p) => ({ ...p, isBestseller: e.target.checked }))} className="rounded accent-primary" /> Bestseller</label>
            </div>
          </div>
          <div className="p-4 sm:p-6 flex flex-col bg-muted/30 min-h-0 overflow-y-auto overflow-x-hidden">
            <p className="text-xs font-medium mb-3 text-muted-foreground shrink-0">Preview</p>
            <div className="flex justify-center min-h-0">
              <ProductPreviewCard form={productForm} />
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end px-4 py-3 sm:px-6 sm:py-4 border-t shrink-0">
          <Button variant="outline" onClick={() => setProductDialogOpen(false)} size="sm" className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={saveProduct} size="sm" className="w-full sm:w-auto">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={!!deleteProductId} onOpenChange={(o) => !o && setDeleteProductId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove product?</AlertDialogTitle>
          <AlertDialogDescription>This will remove the product from your catalog.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={doDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}
