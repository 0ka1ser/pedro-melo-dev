import { buttonVariants } from "@/components/ui/button";
import { AvatarSwap } from "@/components/site/AvatarSwap";
import { NameSwap } from "@/components/site/NameSwap";
import type { SiteContent } from "@/content/types";

export function Hero({ content }: { content: SiteContent["hero"] }) {
  return (
    <section id="inicio" aria-labelledby="inicio-title" className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24">
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <h1 id="inicio-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
            <NameSwap name={content.name} alias={content.alias} />
          </h1>
          <p className="mt-4 text-lg">{content.headline}</p>
          <p className="mt-4 max-w-prose text-muted-foreground">{content.bio}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#destaque" className={buttonVariants()}>
              {content.ctaProjects}
            </a>
            <a href={content.cvHref} download className={buttonVariants({ variant: "outline" })}>
              {content.ctaCv}
            </a>
          </div>
        </div>
        <AvatarSwap src="/avatar.jpg" alt={content.avatarAlt} />
      </div>
    </section>
  );
}
