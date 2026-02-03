import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useSiteContent } from '@/context/SiteContentContext';

const HERO_STAGGER_MS = {
  badge: 0,
  headline: 100,
  text: 200,
  buttons: 300,
  trust: 400,
  image: 200,
  card: 450,
} as const;

const HERO_REVEAL_CLASS = 'opacity-0 animate-fade-in-up';

export default function Hero() {
  const { hero } = useSiteContent();
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-16 items-end">
          <div className="text-center lg:text-left space-y-6 order-2 lg:order-1">
            <div
              className={`inline-block px-4 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-sm font-medium ${HERO_REVEAL_CLASS}`}
              style={{ animationDelay: `${HERO_STAGGER_MS.badge}ms` }}
            >
              {hero.badge}
            </div>
            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight ${HERO_REVEAL_CLASS}`}
              style={{ animationDelay: `${HERO_STAGGER_MS.headline}ms` }}
            >
              {hero.headlineLine1}
              <span className="text-primary block">{hero.headlineLine2}</span>
            </h1>
            <p
              className={`text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 ${HERO_REVEAL_CLASS}`}
              style={{ animationDelay: `${HERO_STAGGER_MS.text}ms` }}
            >
              {hero.description}
            </p>
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start ${HERO_REVEAL_CLASS}`}
              style={{ animationDelay: `${HERO_STAGGER_MS.buttons}ms` }}
            >
              <Button size="lg" className="text-lg px-8 group">
                {hero.ctaPrimary}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                {hero.ctaSecondary}
              </Button>
            </div>
            <div
              className={`flex items-center justify-center lg:justify-start gap-6 pt-4 text-sm text-muted-foreground ${HERO_REVEAL_CLASS}`}
              style={{ animationDelay: `${HERO_STAGGER_MS.trust}ms` }}
            >
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

          <div className="relative order-1 lg:order-2 lg:-mb-32">
            <div
              className={`relative z-10 ${HERO_REVEAL_CLASS}`}
              style={{ animationDelay: `${HERO_STAGGER_MS.image}ms` }}
            >
              <img
                src={hero.imageUrl}
                alt="Beautiful Indian ethnic wear"
                className="rounded-2xl shadow-2xl mx-auto lg:ml-0 lg:max-w-none lg:w-[110%]"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
            <div
              className={`absolute bottom-8 -left-4 bg-card p-4 rounded-xl shadow-lg border border-border ${HERO_REVEAL_CLASS}`}
              style={{ animationDelay: `${HERO_STAGGER_MS.card}ms` }}
            >
              <div className="text-sm font-medium text-foreground">{hero.trendingLabel}</div>
              <div className="text-xs text-muted-foreground">{hero.trendingSubtext}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
