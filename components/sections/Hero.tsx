import { FlowButton } from "@/components/ui/flow-button";
import { DownloadButton } from "@/components/site/DownloadButton";
import { Frame } from "@/components/site/Section";
import { AvatarSwap } from "@/components/site/AvatarSwap";
import { NameSwap } from "@/components/site/NameSwap";
import type { SiteContent } from "@/content/types";

// Repouso: foto de estúdio do Pedro. Hover (ou toque): o desenho, como easter egg (ver AvatarSwap).
const avatars = ["/avatar/original.webp", "/avatar/personagem.webp"] as const;

export function Hero({ content }: { content: SiteContent["hero"] }) {
  return (
    <Frame id="inicio" labelledBy="inicio-title" className="py-16 sm:py-24">
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <h1 id="inicio-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
            <NameSwap name={content.name} alias={content.alias} />
          </h1>
          <p className="mt-4 text-lg">{content.headline}</p>
          <p className="mt-4 max-w-prose text-muted-foreground">{content.bio}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <FlowButton href="#destaque" size="lg">
              {content.ctaProjects}
            </FlowButton>
            <DownloadButton href={content.cvHref} errorMessage={content.ctaCvError}>
              {content.ctaCv}
            </DownloadButton>
          </div>
        </div>
        <AvatarSwap images={avatars} alt={content.avatarAlt} />
      </div>
    </Frame>
  );
}
