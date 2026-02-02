import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-6">
            <div className="inline-block px-4 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-sm font-medium">
              ✨ New Wedding Collection 2024
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Celebrate Your
              <span className="text-primary block">Indian Heritage</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Discover exquisite ethnic wear handcrafted with love. From traditional sarees to 
              contemporary lehengas, find your perfect festive outfit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="text-lg px-8 group">
                Shop Collection
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Lookbook
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-secondary">★★★★★</span>
                <span>4.9/5 Reviews</span>
              </div>
              <div>|</div>
              <div>Free Alterations</div>
              <div>|</div>
              <div>COD Available</div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=750&fit=crop"
                alt="Beautiful Indian ethnic wear"
                className="rounded-2xl shadow-2xl mx-auto"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-primary/20 rounded-full blur-2xl" />
            
            {/* Floating badge */}
            <div className="absolute bottom-8 -left-4 bg-card p-4 rounded-xl shadow-lg border border-border">
              <div className="text-sm font-medium text-foreground">🔥 Trending Now</div>
              <div className="text-xs text-muted-foreground">Bridal Lehengas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
