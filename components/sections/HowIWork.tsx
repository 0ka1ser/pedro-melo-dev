import { Section } from "@/components/site/Section";
import type { SiteContent } from "@/content/types";

export function HowIWork({ content }: { content: SiteContent["howIWork"] }) {
  return (
    <Section head={content}>
      <ol className="grid list-decimal gap-6 pl-5 marker:text-subtle-foreground md:grid-cols-2">
        {content.steps.map((step) => (
          <li key={step.title}>
            <h3 className="font-medium">{step.title}</h3>
            <p className="mt-1 text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
