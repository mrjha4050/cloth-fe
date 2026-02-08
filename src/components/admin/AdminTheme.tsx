import { useState } from 'react';
import {
  Image as ImageIcon,
  Megaphone,
  Type,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useSiteContent, BannerContent, HeroContent, HeadingsContent } from '@/context/SiteContentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

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

export function AdminTheme() {
    const {
        banner,
        hero,
        headings,
        setBanner,
        setHero,
        setHeadings,
        resetToDefaults,
    } = useSiteContent();

    const [bannerDraft, setBannerDraft] = useState(banner);
    const [heroDraft, setHeroDraft] = useState(hero);
    const [headingsDraft, setHeadingsDraft] = useState(headings);

    const saveBanner = () => { setBanner(bannerDraft); toast.success('Banner saved'); };
    const saveHero = () => { setHero(heroDraft); toast.success('Hero saved'); };
    const saveHeadings = () => { setHeadings(headingsDraft); toast.success('Headings saved'); };

    const handleReset = () => {
        resetToDefaults();
        setBannerDraft(DEFAULT_RESET.banner);
        setHeroDraft(DEFAULT_RESET.hero);
        setHeadingsDraft(DEFAULT_RESET.headings);
        toast.success('Reset to defaults');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button variant="outline" onClick={handleReset} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Reset to defaults
                </Button>
            </div>
            <div className="max-w-4xl space-y-8 mx-auto">
              {/* Hero */}
              <section className="border rounded-lg p-6 bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Hero section</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Badge</Label>
                    <Input value={heroDraft.badge} onChange={(e) => setHeroDraft((h) => ({ ...h, badge: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Headline 1</Label>
                      <Input value={heroDraft.headlineLine1} onChange={(e) => setHeroDraft((h) => ({ ...h, headlineLine1: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Headline 2</Label>
                      <Input value={heroDraft.headlineLine2} onChange={(e) => setHeroDraft((h) => ({ ...h, headlineLine2: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Description</Label>
                    <Textarea value={heroDraft.description} onChange={(e) => setHeroDraft((h) => ({ ...h, description: e.target.value }))} rows={2} className="resize-none" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Image URL</Label>
                    <Input value={heroDraft.imageUrl} onChange={(e) => setHeroDraft((h) => ({ ...h, imageUrl: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Primary CTA</Label>
                      <Input value={heroDraft.ctaPrimary} onChange={(e) => setHeroDraft((h) => ({ ...h, ctaPrimary: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Secondary CTA</Label>
                      <Input value={heroDraft.ctaSecondary} onChange={(e) => setHeroDraft((h) => ({ ...h, ctaSecondary: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Trending label</Label>
                      <Input value={heroDraft.trendingLabel} onChange={(e) => setHeroDraft((h) => ({ ...h, trendingLabel: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Trending subtext</Label>
                      <Input value={heroDraft.trendingSubtext} onChange={(e) => setHeroDraft((h) => ({ ...h, trendingSubtext: e.target.value }))} />
                    </div>
                  </div>
                  <Button onClick={saveHero} size="sm">
                    <Save className="h-4 w-4 mr-2" /> Save hero
                  </Button>
                </div>
              </section>

              {/* Banner */}
              <section className="border rounded-lg p-6 bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Megaphone className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Top banner</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Banner text</Label>
                    <Input value={bannerDraft.text} onChange={(e) => setBannerDraft((b) => ({ ...b, text: e.target.value }))} placeholder="e.g. Free shipping on orders above ₹2,999" />
                  </div>
                  <div className="p-3 rounded-md text-sm bg-primary/10 text-primary">
                    Preview: {bannerDraft.text || '(empty)'}
                  </div>
                  <Button onClick={saveBanner} size="sm">
                    <Save className="h-4 w-4 mr-2" /> Save banner
                  </Button>
                </div>
              </section>

              {/* Headings */}
              <section className="border rounded-lg p-6 bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Type className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Section headings</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Bestselling title</Label>
                    <Input value={headingsDraft.bestsellingTitle} onChange={(e) => setHeadingsDraft((h) => ({ ...h, bestsellingTitle: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Bestselling subtitle</Label>
                    <Input value={headingsDraft.bestsellingSubtitle} onChange={(e) => setHeadingsDraft((h) => ({ ...h, bestsellingSubtitle: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Categories title</Label>
                    <Input value={headingsDraft.categoriesTitle} onChange={(e) => setHeadingsDraft((h) => ({ ...h, categoriesTitle: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Categories subtitle</Label>
                    <Input value={headingsDraft.categoriesSubtitle} onChange={(e) => setHeadingsDraft((h) => ({ ...h, categoriesSubtitle: e.target.value }))} />
                  </div>
                  <Button onClick={saveHeadings} size="sm">
                    <Save className="h-4 w-4 mr-2" /> Save headings
                  </Button>
                </div>
              </section>
            </div>
        </div>
    );
}
