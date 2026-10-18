import { FlowButton } from "@/components/ui/flow-button";
import type { SiteContent } from "@/content/types";
import { LangSwitch } from "./LangSwitch";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";

const focus = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2";

export function Nav({ content, brand }: { content: SiteContent["nav"]; brand: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#inicio" className={`text-sm font-semibold ${focus}`}>
          {brand}
        </a>
        <nav className="hidden items-center gap-5 md:flex">
          {content.links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`text-sm text-muted-foreground hover:text-foreground ${focus}`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LangSwitch target={content.langSwitch.target} label={content.langSwitch.label} />
          <ThemeToggle label={content.themeLabel} />
          <FlowButton href="#contato" className="max-md:hidden">
            {content.contactCta}
          </FlowButton>
          <MobileMenu content={content} />
        </div>
      </div>
    </header>
  );
}
