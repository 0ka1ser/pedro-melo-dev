import { Section } from "@/components/site/Section";
import { TechMarquee } from "@/components/site/TechMarquee";
import type { SiteContent } from "@/content/types";

export function Stack({ content }: { content: SiteContent["stack"] }) {
  return (
    <Section head={content}>
      <TechMarquee items={content.items} />
    </Section>
  );
}
