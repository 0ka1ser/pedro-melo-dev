import { Section, textLink } from "@/components/site/Section";
import type { SiteContent } from "@/content/types";

export function MoreProjects({ content }: { content: SiteContent["moreProjects"] }) {
  return (
    <Section head={content}>
      <ul className="divide-y divide-border border-y border-border">
        {content.items.map((item) => (
          <li key={item.name} className="grid gap-1 py-4 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-6">
            <p className="font-medium">
              {item.href ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer" className={textLink}>
                  {item.name}
                </a>
              ) : (
                item.name
              )}
            </p>
            <p className="text-muted-foreground">{item.line}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
