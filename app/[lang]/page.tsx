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
import { getContent } from "@/content";
import { hasLocale } from "@/lib/i18n";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const c = getContent(lang);
  return (
    <main>
      <Hero content={c.hero} />
      <Featured content={c.featured} />
      <HowIWork content={c.howIWork} />
      <Experience content={c.experience} />
      <Stack content={c.stack} />
      <MoreProjects content={c.moreProjects} />
      <KaiserInc content={c.kaiserinc} />
      <Services content={c.services} />
      <Contact content={c.contact} />
    </main>
  );
}
