import { buttonVariants } from "@/components/ui/button";
import type { SiteContent } from "@/content/types";
import { cn } from "@/lib/utils";
import { LangSwitch } from "./LangSwitch";
import { MobileMenu } from "./MobileMenu";

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
          <a href="#contato" className={cn(buttonVariants({ size: "sm" }), "max-md:hidden", focus)}>
            {content.contactCta}
          </a>
          <MobileMenu content={content} />
        </div>
      </div>
    </header>
  );
}
