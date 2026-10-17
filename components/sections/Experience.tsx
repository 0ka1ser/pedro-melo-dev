import { Section } from "@/components/site/Section";
import type { SiteContent } from "@/content/types";

export function Experience({ content }: { content: SiteContent["experience"] }) {
  const { education } = content;
  return (
    <Section head={content}>
      <ol className="grid gap-8">
        {content.items.map((item) => (
          <li key={`${item.role}-${item.period}`} className="grid gap-1 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-6">
            <p className="text-sm text-muted-foreground">{item.period}</p>
            <div>
              <p className="font-medium">
                {item.role} · {item.org}
              </p>
              <p className="mt-1 text-muted-foreground">{item.line}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold">{content.educationTitle}</h3>
          <p className="mt-3 font-medium">{education.course}</p>
          <p className="text-muted-foreground">
            {education.school} · {education.period}
          </p>
          <p className="text-muted-foreground">{education.honor}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">{content.certificationsTitle}</h3>
          <ul className="mt-3 grid gap-2">
            {content.certifications.map((cert) => (
              <li key={cert.name}>
                <span className="font-medium">{cert.name}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {cert.org} · {cert.date}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
