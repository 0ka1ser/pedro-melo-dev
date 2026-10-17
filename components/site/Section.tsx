import type { SectionHead } from "@/content/types";
import { cn } from "@/lib/utils";

export const focusRing = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2";
export const textLink = `text-primary-text underline-offset-4 hover:underline ${focusRing}`;

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
    <section
      id={head.id}
      aria-labelledby={`${head.id}-title`}
      className={cn("mx-auto w-full max-w-5xl scroll-mt-20 px-4 py-20 sm:px-6", className)}
    >
      <h2 id={`${head.id}-title`} className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {head.title}
      </h2>
      {head.lead ? <p className="mt-3 max-w-prose text-muted-foreground">{head.lead}</p> : null}
      {children ? <div className="mt-10">{children}</div> : null}
    </section>
  );
}
