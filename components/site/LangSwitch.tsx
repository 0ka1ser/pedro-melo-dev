"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function LangSwitch({ target, label }: { target: "pt" | "en"; label: string }) {
  const router = useRouter();
  return (
    <Link
      href={`/${target}`}
      hrefLang={target}
      onClick={(event) => {
        // Lê o hash no clique: o hash muda sem re-render e um estado ficaria defasado.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        router.push(`/${target}${window.location.hash}`);
      }}
      className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {label}
    </Link>
  );
}
