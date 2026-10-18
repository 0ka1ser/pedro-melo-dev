"use client";

import { useEffect, useRef } from "react";

// Cursor em matriz de pontos: um anel de quadrados numa grade fixa na tela (por isso os pontos
// "rastejam" quando o anel anda) e um losango de pontos finos exatamente sob o ponteiro.
// O anel se comporta como um fluido: o contorno ondula em lóbulos que giram no sentido horário,
// uma faixa de brilho varre o anel no mesmo sentido, e a forma deforma como gelatina (mola
// subamortecida) quando o mouse acelera ou freia. Sobre links ele cresce e troca para o lilás da
// KaiserInc (token --primary-text), clareando em direção ao branco do tema ao longo da faixa de brilho.
// Os tons ficam sempre mais claros que o roxo dos botões (--primary), senão o anel some em cima deles.
const PITCH = 4; // lado da célula da grade, em px
const RADIUS = 19;
const HOVER_RADIUS = 22;
const PRESS_SCALE = 0.84;
const DOT_PITCH = PITCH / 2;
const STEP = 1 / 240;
const SPIN = 1.9; // rad/s da faixa de brilho; positivo = sentido horário na tela (y para baixo)
const FIELD = "input, textarea, select, [contenteditable='true']";
const LINK = "a, button, [role='button'], summary, label[for]";

type RGB = [number, number, number];

const noise = (x: number, y: number) => {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v));
// Afasta a cor do cinza de mesma luminância: deixa o lilás do token mais intenso.
const saturate = ([r, g, b]: RGB, amount: number): RGB => {
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  const push = (v: number) => Math.max(0, Math.min(255, gray + (v - gray) * amount));
  return [push(r), push(g), push(b)];
};

export function Cursor() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const html = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    const pctx = probe.getContext("2d", { willReadFrequently: true })!;
    const toRGB = (css: string): RGB => {
      pctx.clearRect(0, 0, 1, 1);
      pctx.fillStyle = "#000";
      pctx.fillStyle = css.trim();
      pctx.fillRect(0, 0, 1, 1);
      const d = pctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    };

    const ptr = { x: 0, y: 0 };
    const ring = { x: 0, y: 0, vx: 0, vy: 0 };
    const def = { x: 0, y: 0, vx: 0, vy: 0 }; // deformação de gelatina, em px
    const rad = { r: RADIUS, v: 0 };
    let w = 0;
    let h = 0;
    let dpr = 1;
    let vis = 0;
    let visTarget = 0;
    let hover = 0;
    let seen = false;
    let overField = false;
    let overLink = false;
    let pressed = false;
    let raf = 0;
    let last = 0;
    let time = 0;
    let colorAt = -1e9;
    let fg: RGB = [255, 255, 255];
    let light: RGB = [190, 160, 255];
    let pale: RGB = [225, 210, 255];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };

    const refreshColors = (now: number) => {
      if (now - colorAt < 400) return;
      colorAt = now;
      const style = getComputedStyle(canvas);
      fg = toRGB(style.color);
      light = saturate(toRGB(style.getPropertyValue("--primary-text")), 1.7);
      pale = [lerp(light[0], fg[0], 0.15), lerp(light[1], fg[1], 0.15), lerp(light[2], fg[2], 0.15)];
    };

    // Mistura o branco do tema com o lilás; `tone` 1 é o tom mais claro, 0 o lilás puro.
    const paint = (tone: number) => {
      const t = hover;
      const r = lerp(fg[0], lerp(light[0], pale[0], tone), t);
      const g = lerp(fg[1], lerp(light[1], pale[1], tone), t);
      const b = lerp(fg[2], lerp(light[2], pale[2], tone), t);
      ctx.fillStyle = `rgb(${r | 0} ${g | 0} ${b | 0})`;
    };

    const draw = (now: number, animated: boolean) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (vis < 0.01) return;
      refreshColors(now);

      const mag = animated ? Math.min(Math.hypot(def.x, def.y) / RADIUS, 0.75) : 0;
      const ux = mag > 0.001 ? def.x / Math.hypot(def.x, def.y) : 1;
      const uy = mag > 0.001 ? def.y / Math.hypot(def.x, def.y) : 0;
      const along = 1 + 0.8 * mag;
      const across = 1 / Math.sqrt(along);
      const agitation = 1 + 1.6 * mag;
      const R = rad.r;
      const reach = R * along * 1.5 + PITCH * 2;
      const spin = SPIN * time;

      for (let gy = Math.floor((ring.y - reach) / PITCH); gy <= Math.ceil((ring.y + reach) / PITCH); gy++) {
        for (let gx = Math.floor((ring.x - reach) / PITCH); gx <= Math.ceil((ring.x + reach) / PITCH); gx++) {
          const cx = (gx + 0.5) * PITCH;
          const cy = (gy + 0.5) * PITCH;
          const dx = cx - ring.x;
          const dy = cy - ring.y;
          const du = dx * ux + dy * uy;
          const dv = -dx * uy + dy * ux;
          const theta = Math.atan2(dy, dx);
          // Lóbulos com fase (k·θ − ω·t): crescem no sentido de θ, que na tela é o horário.
          const wobble = animated
            ? (0.07 * Math.sin(2 * theta - 1.1 * time) +
                0.05 * Math.sin(3 * theta - 1.7 * time + 1.3) +
                0.025 * Math.sin(5 * theta - 2.6 * time + 0.4) +
                0.025 * Math.sin(1.4 * time)) *
              agitation
            : 0;
          const edge = Math.hypot(du / along, dv / across) - R * (1 + wobble);
          const cover = 1 - Math.abs(edge) / (PITCH * 0.7);
          if (cover <= 0.12) continue;
          const sweep = animated ? 0.5 + 0.5 * Math.cos(theta - spin) : 0.6;
          const size = PITCH * (0.58 + 0.34 * Math.min(cover, 1)) * (0.88 + 0.12 * sweep);
          ctx.globalAlpha = vis * Math.min(1, 0.3 + 0.9 * cover) * lerp(0.5 + 0.5 * noise(gx, gy), 0.85 + 0.15 * noise(gx, gy), hover) *
            lerp(0.45 + 0.55 * sweep, 0.9 + 0.1 * sweep, hover);
          paint(sweep);
          ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
        }
      }

      paint(1);
      for (let j = -2; j <= 2; j++) {
        for (let i = -2; i <= 2; i++) {
          const manhattan = Math.abs(i) + Math.abs(j);
          if (manhattan > 2) continue;
          const size = manhattan === 0 ? 1.9 : 1.5;
          ctx.globalAlpha = vis * (manhattan === 0 ? 1 : manhattan === 1 ? 0.8 : 0.55) * (1 - 0.35 * mag);
          ctx.fillRect(ptr.x + i * DOT_PITCH - size / 2, ptr.y + j * DOT_PITCH - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const animated = !reduce.matches;
      if (animated) time += dt;

      // Mola quase rígida: o anel fica a ~1 raio do ponteiro mesmo em movimento rápido, como na referência.
      const k = animated ? 3000 : 9000;
      const c = 2 * Math.sqrt(k) * 0.8;
      // Gelatina: segue a velocidade do anel com mola subamortecida (ζ≈0,3), então estica e balança.
      const kd = 380;
      const cd = 2 * 0.3 * Math.sqrt(kd);
      for (let t = 0; t < dt; t += STEP) {
        ring.vx += ((ptr.x - ring.x) * k - ring.vx * c) * STEP;
        ring.vy += ((ptr.y - ring.y) * k - ring.vy * c) * STEP;
        ring.x += ring.vx * STEP;
        ring.y += ring.vy * STEP;
        const tx = animated ? clamp(ring.vx * 0.011, RADIUS * 0.6) : 0;
        const ty = animated ? clamp(ring.vy * 0.011, RADIUS * 0.6) : 0;
        def.vx += ((tx - def.x) * kd - def.vx * cd) * STEP;
        def.vy += ((ty - def.y) * kd - def.vy * cd) * STEP;
        def.x += def.vx * STEP;
        def.y += def.vy * STEP;
      }

      const targetR = (overLink ? HOVER_RADIUS : RADIUS) * (pressed ? PRESS_SCALE : 1);
      rad.v += ((targetR - rad.r) * 320 - rad.v * 36) * dt;
      rad.r += rad.v * dt;
      vis += (visTarget - vis) * (1 - Math.exp(-dt / (visTarget ? 0.06 : 0.09)));
      hover += ((overLink ? 1 : 0) - hover) * (1 - Math.exp(-dt / 0.12));
      draw(now, animated);
      if (animated) canvas.dataset.spin = (SPIN * time).toFixed(3);

      const hidden = visTarget === 0 && vis < 0.01;
      const settled =
        !animated &&
        Math.hypot(ptr.x - ring.x, ptr.y - ring.y) < 0.2 &&
        Math.hypot(ring.vx, ring.vy) < 1 &&
        Math.abs(targetR - rad.r) < 0.1 &&
        Math.abs((overLink ? 1 : 0) - hover) < 0.01 &&
        Math.abs(visTarget - vis) < 0.01;
      raf = hidden || settled ? 0 : requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      ptr.x = event.clientX;
      ptr.y = event.clientY;
      const target = event.target instanceof Element ? event.target : null;
      const field = target?.closest(FIELD) != null;
      if (!seen) {
        seen = true;
        ring.x = ptr.x;
        ring.y = ptr.y;
        ring.vx = ring.vy = 0;
      }
      if (field !== overField || !html.dataset.customCursor) {
        overField = field;
        html.dataset.customCursor = field ? "off" : "on";
      }
      overLink = !field && target?.closest(LINK) != null;
      visTarget = field ? 0 : 1;
      wake();
    };
    const leave = () => {
      seen = false;
      visTarget = 0;
      wake();
    };
    const press = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pressed = event.type === "pointerdown";
      wake();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", press);
    html.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", press);
      html.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
      delete html.dataset.customCursor;
    };
  }, []);

  return (
    <canvas
      ref={ref}
      data-cursor
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] size-full text-foreground"
    />
  );
}
