"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

// Troca de foto em mosaico: a grade de ladrilhos vira, um a um e em ordem aleatória, da imagem
// atual para a seguinte (às vezes passando por um buraco vazio). `images` é [repouso, easter egg].
// Desktop: hover vai a 1 e sair volta a 0; o clique não faz nada. Toque e teclado: cada
// acionamento alterna entre os dois.
const GRID = 8;

type Tile = { src: number; to: number; start: number; blank: number };
type Engine = { go: (target: number) => void; target: () => number };

export function AvatarSwap({ images, alt }: { images: readonly string[]; alt: string }) {
  const button = useRef<HTMLButtonElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Engine | null>(null);
  const pointer = useRef("mouse");

  useEffect(() => {
    const el = canvas.current;
    const btn = button.current;
    const ctx = el?.getContext("2d");
    if (!el || !btn || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tiles: Tile[] = Array.from({ length: GRID * GRID }, () => ({ src: 0, to: 0, start: 0, blank: 0 }));
    const pics = images.map((src) => Object.assign(new window.Image(), { src }));
    let alive = true;
    let ready = false;
    let size = 0;
    let target = 0;
    let raf = 0;

    const draw = (now: number) => {
      ctx.clearRect(0, 0, size, size);
      let pending = false;
      tiles.forEach((tile, i) => {
        let src = tile.src;
        if (now >= tile.start) {
          if (now < tile.start + tile.blank) src = -1;
          else {
            tile.src = tile.to;
            src = tile.to;
          }
        }
        if (tile.src !== tile.to) pending = true;
        const img = pics[src];
        if (!img?.naturalWidth) return;
        const cx = i % GRID;
        const cy = Math.floor(i / GRID);
        const x0 = Math.round((cx * size) / GRID);
        const y0 = Math.round((cy * size) / GRID);
        const x1 = Math.round(((cx + 1) * size) / GRID);
        const y1 = Math.round(((cy + 1) * size) / GRID);
        const sw = img.naturalWidth / GRID;
        const sh = img.naturalHeight / GRID;
        ctx.drawImage(img, cx * sw, cy * sh, sw, sh, x0, y0, x1 - x0, y1 - y0);
      });
      btn.dataset.shown = pending ? "mixed" : String(target);
      btn.dataset.image = pending ? "" : images[target];
      return pending;
    };

    const frame = (now: number) => {
      raf = draw(now) ? requestAnimationFrame(frame) : 0;
    };

    const resize = () => {
      size = Math.round(el.clientWidth * Math.min(window.devicePixelRatio || 1, 2));
      el.width = el.height = size;
      if (ready) draw(performance.now());
    };

    const go = (next: number) => {
      if (!ready || next === target) return;
      target = next;
      const now = performance.now();
      const span = reduce.matches ? 240 : 900;
      for (const tile of tiles) {
        // O que o ladrilho mostra agora vira o ponto de partida, então dá para interromper no meio.
        const shown = now >= tile.start ? tile.to : tile.src;
        if (shown === next) {
          Object.assign(tile, { src: next, to: next, start: 0, blank: 0 });
          continue;
        }
        Object.assign(tile, {
          src: shown,
          to: next,
          start: now + Math.random() * span * 0.55,
          blank: reduce.matches || Math.random() > 0.6 ? 0 : span * 0.18 * (0.5 + Math.random()),
        });
      }
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    Promise.all(pics.map((img) => img.decode().catch(() => undefined))).then(() => {
      if (!alive) return;
      ready = true;
      draw(performance.now());
      el.dataset.ready = btn.dataset.ready = "true";
    });
    engine.current = { go, target: () => target };
    return () => {
      alive = false;
      observer.disconnect();
      cancelAnimationFrame(raf);
      engine.current = null;
    };
  }, [images]);

  return (
    <button
      ref={button}
      type="button"
      data-avatar-swap
      data-shown="0"
      data-image={images[0]}
      onPointerDown={(event) => (pointer.current = event.pointerType)}
      onPointerEnter={(event) => event.pointerType === "mouse" && engine.current?.go(1)}
      onPointerLeave={(event) => event.pointerType === "mouse" && engine.current?.go(0)}
      onClick={(event) => {
        const state = engine.current;
        // Com mouse o hover já cuida da troca; toque e teclado (detail 0) alternam.
        if (state && (event.detail === 0 || pointer.current !== "mouse")) state.go((state.target() + 1) % images.length);
      }}
      className="group/avatar relative block size-48 overflow-hidden rounded-lg border border-border bg-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 sm:size-64"
    >
      <Image
        src={images[0]}
        alt={alt}
        width={640}
        height={640}
        unoptimized
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover group-data-[ready=true]/avatar:opacity-0"
      />
      <canvas ref={canvas} data-avatar-canvas aria-hidden="true" className="absolute inset-0 size-full" />
    </button>
  );
}
