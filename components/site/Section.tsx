import type { SectionHead } from "@/content/types";
import { cn } from "@/lib/utils";

export const focusRing = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2";
export const textLink = `text-primary-text underline-offset-4 hover:underline ${focusRing}`;

const guideEdges = ["left-[calc(50%-32rem)]", "left-[calc(50%+32rem)]"] as const;

// Guias de fundo: linhas verticais nas bordas da coluna de conteúdo (32rem = metade de max-w-5xl) e
// marcas "+" onde cruzam a linha horizontal do topo. Só em telas largas, só decoração.
function Guides() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      {guideEdges.map((edge) => (
        <span key={edge} data-guide-line className={cn("absolute inset-y-0 w-px bg-border", edge)} />
      ))}
      {guideEdges.map((edge) => (
        <span
          key={`plus-${edge}`}
          data-guide-plus
          className={cn(
            "absolute top-0 size-[11px] -translate-x-1/2 -translate-y-1/2 before:absolute before:top-1/2 before:left-0 before:h-px before:w-full before:bg-border-strong after:absolute after:top-0 after:left-1/2 after:h-full after:w-px after:bg-border-strong",
            edge,
          )}
        />
      ))}
    </div>
  );
}

// Faixa diagonal hachurada entre dois blocos, no estilo da referência.
export function GuideBand() {
  return (
    <div
      aria-hidden="true"
      data-guide-band
      className="relative h-8 border-t border-border bg-[repeating-linear-gradient(135deg,var(--border)_0_1px,transparent_1px_7px)]"
    >
      <Guides />
    </div>
  );
}

export function Frame({
  id,
  labelledBy,
  className,
  children,
}: {
  id: string;
  labelledBy: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className="relative scroll-mt-20 border-t border-border first:border-t-0">
      <Guides />
      <div className={cn("relative mx-auto w-full max-w-5xl px-4 py-20 sm:px-6", className)}>{children}</div>
    </section>
  );
}

export function Section({
  head,
  className,
  children,
}: {
  head: SectionHead;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Frame id={head.id} labelledBy={`${head.id}-title`} className={className}>
      <h2 id={`${head.id}-title`} className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {head.title}
      </h2>
      {head.lead ? <p className="mt-3 max-w-prose text-muted-foreground">{head.lead}</p> : null}
      {children ? <div className="mt-10">{children}</div> : null}
    </Frame>
  );
}
