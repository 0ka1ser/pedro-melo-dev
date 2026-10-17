import { Section, textLink } from "@/components/site/Section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { SiteContent } from "@/content/types";

export function KaiserInc({ content }: { content: SiteContent["kaiserinc"] }) {
  return (
    <Section head={content}>
      <p className="max-w-prose">{content.intro}</p>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {content.products.map((product) => (
          <li key={product.name} className="grid gap-1 py-4 md:grid-cols-[14rem_minmax(0,1fr)_auto] md:items-baseline md:gap-6">
            <p className="font-medium">
              {product.href ? (
                <a href={product.href} target="_blank" rel="noopener noreferrer" className={textLink}>
                  {product.name}
                </a>
              ) : (
                product.name
              )}
            </p>
            <p className="text-muted-foreground">{product.line}</p>
            <Badge variant="primary" className="w-fit">
              {product.status}
            </Badge>
          </li>
        ))}
      </ul>
      <a href={content.cta.href} target="_blank" rel="noopener noreferrer" className={`${buttonVariants({ variant: "outline" })} mt-8`}>
        {content.cta.label}
      </a>
    </Section>
  );
}
