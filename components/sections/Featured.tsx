import { Section, textLink } from "@/components/site/Section";
import { Badge } from "@/components/ui/badge";
import type { SiteContent } from "@/content/types";

export function Featured({ content }: { content: SiteContent["featured"] }) {
  const { labels } = content;
  return (
    <Section head={content}>
      <div className="grid gap-12">
        {content.cases.map((item) => (
          <article key={item.title} className="grid gap-6 border-t border-border pt-8 first:border-t-0 first:pt-0 md:grid-cols-[14rem_minmax(0,1fr)]">
            <header>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.org} · {item.period}
              </p>
            </header>
            <div className="grid gap-5">
              <dl className="grid gap-5">
                <div>
                  <dt className="text-sm font-medium text-subtle-foreground">{labels.problem}</dt>
                  <dd className="mt-1">{item.problem}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-subtle-foreground">{labels.role}</dt>
                  <dd className="mt-1">{item.role}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-subtle-foreground">{labels.decisions}</dt>
                  <dd className="mt-1">
                    <ul className="list-disc space-y-1 pl-5">
                      {item.decisions.map((decision) => (
                        <li key={decision}>{decision}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-subtle-foreground">{labels.result}</dt>
                  <dd className="mt-1">{item.result}</dd>
                </div>
              </dl>
              <ul className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <li key={tag}>
                    <Badge>{tag}</Badge>
                  </li>
                ))}
              </ul>
              {item.link ? (
                <a href={item.link.href} target="_blank" rel="noopener noreferrer" className={`w-fit text-sm ${textLink}`}>
                  {item.link.label}
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
