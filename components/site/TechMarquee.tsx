import type { SiteContent } from "@/content/types";

function Item({ name, icon }: { name: string; icon: string }) {
  const mask = `url(/stack/${icon})`;
  return (
    <>
      <span
        aria-hidden="true"
        className="size-7 shrink-0 bg-muted-foreground"
        style={{
          maskImage: mask,
          WebkitMaskImage: mask,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
      <span className="text-sm whitespace-nowrap text-muted-foreground">{name}</span>
    </>
  );
}

export function TechMarquee({ items }: { items: SiteContent["stack"]["items"] }) {
  return (
    <div className="marquee overflow-hidden">
      <ul data-marquee-track className="marquee-track flex w-max">
        {items.map((item) => (
          <li key={item.name} className="flex shrink-0 items-center gap-3 pr-10">
            <Item {...item} />
          </li>
        ))}
        {items.map((item) => (
          <li key={`${item.name}-dup`} aria-hidden="true" data-dup className="flex shrink-0 items-center gap-3 pr-10">
            <Item {...item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
