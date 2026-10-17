import { notFound } from "next/navigation";
import { Section } from "@/components/site/Section";
import { getContent } from "@/content";
import { hasLocale } from "@/lib/i18n";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const c = getContent(lang);
  return (
    <main>
      <div id="inicio" />
      <Section head={c.featured} />
      <Section head={c.howIWork} />
      <Section head={c.experience} />
      <Section head={c.stack} />
      <Section head={c.moreProjects} />
      <Section head={c.kaiserinc} />
      <Section head={c.services} />
      <Section head={c.contact} />
    </main>
  );
}
