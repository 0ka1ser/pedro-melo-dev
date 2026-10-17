import { Section } from "@/components/site/Section";
import { buttonVariants } from "@/components/ui/button";
import type { SiteContent } from "@/content/types";

export function Services({ content }: { content: SiteContent["services"] }) {
  return (
    <Section head={content}>
      <div className="grid gap-8 md:grid-cols-2">
        {content.offers.map((offer) => (
          <div key={offer.title}>
            <h3 className="text-lg font-semibold">{offer.title}</h3>
            <p className="mt-2 text-muted-foreground">{offer.body}</p>
          </div>
        ))}
      </div>
      <a href="#contato" className={`${buttonVariants()} mt-8`}>
        {content.cta}
      </a>
    </Section>
  );
}
