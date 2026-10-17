"use client";

import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { SiteContent } from "@/content/types";

export function MobileMenu({ content }: { content: SiteContent["nav"] }) {
  const [open, setOpen] = useState(false);
  const links = [...content.links, { id: "contato" as const, label: content.contactCta }];
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="sm" className="md:hidden">
            <MenuIcon aria-hidden="true" />
            {content.menuLabel}
          </Button>
        }
      />
      <SheetContent closeLabel={content.closeLabel}>
        <SheetTitle>{content.menuLabel}</SheetTitle>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-base hover:bg-accent focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
