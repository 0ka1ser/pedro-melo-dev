"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Indicador de seção à direita, com dois estados (como na referência):
// - recolhido: uma marca por seção, a atual mais longa e clara;
// - aberto: o nome de cada seção aparece à esquerda da marca. Abre quando o mouse entra numa área
//   larga (ZONE_W para a esquerda das marcas, ZONE_PAD acima e abaixo) ou quando uma marca recebe foco.
// Dentro dessa área o destaque segue a altura do mouse (linha mais próxima) e as marcas crescem como
// num dock, em função da distância contínua ao mouse, suavizada por molas. Marca e nome andam juntos:
// o nome fica sempre colado à ponta da marca.
// No celular só existem as marcas, reduzidas (16px, encostadas na borda); os nomes nunca abrem.
const BASE = 12; // largura da marca em repouso, em px
const CURRENT = 24; // marca da seção atual
const MAX = 34; // largura máxima, sob o mouse (a caixa da marca tem essa largura; o resto é scaleX)
const REACH = 46; // alcance do dock (desvio da gaussiana), em px
const ZONE_W = 260; // não passa muito além dos nomes, para não abrir quando o mouse está no hero
const ZONE_PAD = 48;
const STAGGER = 20; // ms entre um nome e o seguinte ao abrir
const DOCK_MQ = "(min-width: 768px)";

type Spring = { y: number; vy: number; s: number; vs: number; targetY: number; targetS: number };

export function SectionRail({ label, items }: { label: string; items: readonly { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(-1);
  const list = useRef<HTMLUListElement>(null);
  const rows = useRef<(HTMLAnchorElement | null)[]>([]);
  const activeId = useRef(active);
  const redraw = useRef<() => void>(() => undefined);
  const focused = useRef(false);
  const inside = useRef(false);

  useEffect(() => {
    activeId.current = active;
    redraw.current();
  }, [active]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = items[0]?.id;
      for (const item of items) {
        const top = document.getElementById(item.id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= window.innerHeight * 0.4) current = item.id;
      }
      setActive(atBottom ? items[items.length - 1]?.id : current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items]);

  useEffect(() => {
    const ul = list.current;
    if (!ul) return;
    const dock = window.matchMedia(DOCK_MQ);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const spring: Spring = { y: 0, vy: 0, s: 0, vs: 0, targetY: 0, targetS: 0 };
    let raf = 0;
    let last = 0;
    let nearest = -1;

    // Escreve a largura de cada marca (variável --w, lida por marca e nome) a partir das molas.
    const apply = () => {
      const box = ul.getBoundingClientRect();
      const rowH = box.height / items.length;
      items.forEach((item, i) => {
        const base = item.id === activeId.current ? CURRENT : BASE;
        const dy = spring.y - (box.top + (i + 0.5) * rowH);
        const reach = reduce.matches ? (Math.abs(dy) < rowH / 2 ? 1 : 0) : Math.exp(-((dy / REACH) ** 2));
        rows.current[i]?.style.setProperty("--w", (base + (MAX - base) * reach * Math.max(spring.s, 0)).toFixed(2));
      });
    };
    redraw.current = apply;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const ky = 300;
      const ks = 260;
      for (let t = 0; t < dt; t += 1 / 240) {
        const h = 1 / 240;
        spring.vy += ((spring.targetY - spring.y) * ky - spring.vy * 2 * Math.sqrt(ky) * 0.85) * h;
        spring.y += spring.vy * h;
        spring.vs += ((spring.targetS - spring.s) * ks - spring.vs * 2 * Math.sqrt(ks) * 0.8) * h;
        spring.s += spring.vs * h;
      }
      if (reduce.matches) {
        spring.y = spring.targetY;
        spring.s = spring.targetS;
      }
      apply();
      const settled =
        Math.abs(spring.targetY - spring.y) < 0.3 && Math.abs(spring.vy) < 2 && Math.abs(spring.targetS - spring.s) < 0.003 && Math.abs(spring.vs) < 0.05;
      raf = settled ? 0 : requestAnimationFrame(frame);
    };
    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const sync = () => setOpen(inside.current || focused.current);

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !dock.matches) return;
      const box = ul.getBoundingClientRect();
      const near =
        event.clientX >= box.right - ZONE_W && event.clientY >= box.top - ZONE_PAD && event.clientY <= box.bottom + ZONE_PAD;
      if (near) {
        const y = Math.min(Math.max(event.clientY, box.top), box.bottom);
        if (!inside.current) {
          spring.y = y;
          spring.vy = 0;
        }
        spring.targetY = y;
        spring.targetS = 1;
        const index = Math.min(items.length - 1, Math.max(0, Math.floor((y - box.top) / (box.height / items.length))));
        if (index !== nearest) {
          nearest = index;
          setHover(index);
        }
      } else if (inside.current) {
        spring.targetS = 0;
        nearest = -1;
        setHover(-1);
      }
      if (near !== inside.current) {
        inside.current = near;
        sync();
      }
      wake();
    };
    const onLeave = () => {
      if (!inside.current) return;
      inside.current = false;
      spring.targetS = 0;
      nearest = -1;
      setHover(-1);
      sync();
      wake();
    };
    const onFocusIn = (event: FocusEvent) => {
      focused.current = true;
      const index = rows.current.findIndex((row) => row === event.target);
      if (index >= 0) setHover(index);
      sync();
    };
    const onFocusOut = (event: FocusEvent) => {
      if (ul.contains(event.relatedTarget as Node | null)) return;
      focused.current = false;
      if (!inside.current) setHover(-1);
      sync();
    };

    apply();
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    ul.addEventListener("focusin", onFocusIn);
    ul.addEventListener("focusout", onFocusOut);
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      ul.removeEventListener("focusin", onFocusIn);
      ul.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("resize", apply);
      cancelAnimationFrame(raf);
      redraw.current = () => undefined;
    };
  }, [items]);

  return (
    <nav aria-label={label} data-open={open} className="group/rail fixed top-1/2 right-0 z-30 -translate-y-1/2 md:right-3">
      <ul ref={list} className="flex flex-col items-end">
        {items.map((item, index) => {
          const current = active === item.id;
          const lit = open ? hover === index : current;
          return (
            <li key={item.id}>
              <a
                ref={(node) => {
                  rows.current[index] = node;
                }}
                href={`#${item.id}`}
                aria-current={current ? "true" : undefined}
                data-hover={open && hover === index}
                className="relative block h-4 w-4 outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring md:h-7 md:w-10"
              >
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                  <span
                    data-rail-label
                    style={{ transitionDelay: open ? `${index * STAGGER}ms` : "0ms" }}
                    className={cn(
                      "pointer-events-none flex h-7 translate-x-2 items-center rounded-md bg-background/80 pr-4 pl-2 text-sm whitespace-nowrap opacity-0 backdrop-blur-sm [transform:translateX(calc((34-var(--w,12))*1px))] transition-[opacity,translate,color] duration-300 ease-out max-md:sr-only motion-reduce:translate-x-0 motion-reduce:duration-150",
                      "group-data-[open=true]/rail:pointer-events-auto group-data-[open=true]/rail:translate-x-0 group-data-[open=true]/rail:opacity-100",
                      lit || current ? "font-medium text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    data-rail-tick
                    className={cn(
                      "pointer-events-auto block h-px w-[17px] origin-right [scale:calc(var(--w,12)/34)_1] transition-colors duration-200 ease-out md:w-[34px]",
                      lit || current ? "bg-foreground" : "bg-border-strong",
                    )}
                  />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
