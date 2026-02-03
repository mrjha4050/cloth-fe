import { useSiteContent } from '@/context/SiteContentContext';

const CATEGORIES_REVEAL_DELAY_MS = 500;

export default function Categories() {
  const { categories, headings } = useSiteContent();
  return (
    <section className="pt-32 lg:pt-40 pb-16 bg-muted/50">
      <div
        className="container mx-auto px-4 opacity-0 animate-fade-in-up"
        style={{ animationDelay: `${CATEGORIES_REVEAL_DELAY_MS}ms` }}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {headings.categoriesTitle}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {headings.categoriesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="group flex flex-col items-center p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all duration-300"
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {category.icon}
              </span>
              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
