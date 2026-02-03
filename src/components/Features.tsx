import { Truck, RotateCcw, Shield, Sparkles } from 'lucide-react';

const FEATURES_DIAGONAL_CLIP = 'polygon(0 8%, 100% 0, 100% 92%, 0 100%)';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders above ₹2,999',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure checkout',
  },
];

export default function Features() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div
        className="absolute inset-0 bg-primary/5 border-y border-border"
        style={{ clipPath: FEATURES_DIAGONAL_CLIP }}
        aria-hidden
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
