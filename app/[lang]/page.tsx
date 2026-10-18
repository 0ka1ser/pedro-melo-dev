import { notFound } from "next/navigation";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Featured } from "@/components/sections/Featured";
import { Hero } from "@/components/sections/Hero";
import { HowIWork } from "@/components/sections/HowIWork";
import { KaiserInc } from "@/components/sections/KaiserInc";
import { MoreProjects } from "@/components/sections/MoreProjects";
import { Services } from "@/components/sections/Services";
import { Stack } from "@/components/sections/Stack";
import { GuideBand } from "@/components/site/Section";
import { SectionRail } from "@/components/site/SectionRail";
import { getContent } from "@/content";
import { hasLocale } from "@/lib/i18n";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const c = getContent(lang);
  return (
    <>
      <SectionRail
        label={c.nav.sectionsLabel}
        items={[
          { id: "inicio", label: c.hero.name },
          ...[c.featured, c.howIWork, c.experience, c.stack, c.moreProjects, c.kaiserinc, c.services, c.contact].map((s) => ({ id: s.id, label: s.title })),
        ]}
      />
      <main>
        <Hero content={c.hero} />
        <GuideBand />
        <Featured content={c.featured} />
        <HowIWork content={c.howIWork} />
        <Experience content={c.experience} />
        <Stack content={c.stack} />
        <MoreProjects content={c.moreProjects} />
        <KaiserInc content={c.kaiserinc} />
        <Services content={c.services} />
        <GuideBand />
        <Contact content={c.contact} />
      </main>
    </>
  );
}
