"use client";

import { animate, scrambleText } from "animejs";
import { useEffect, useRef, useState } from "react";

type Run = ReturnType<typeof animate>;

export function NameSwap({ name, alias }: { name: string; alias: string }) {
  const visual = useRef<HTMLSpanElement>(null);
  const run = useRef<Run | null>(null);
  const [swapped, setSwapped] = useState(false);

  useEffect(() => () => void run.current?.pause(), []);

  function show(next: boolean) {
    const el = visual.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    run.current?.pause();
    run.current = animate(el, {
      innerHTML: scrambleText({
        text: next ? alias : name,
        // D8: com movimento reduzido a troca continua, só que bem mais curta.
        settleDuration: reduce ? 100 : 320,
        revealRate: reduce ? 120 : 40,
      }),
    });
    setSwapped(next);
  }

  return (
    <span
      data-name-swap
      data-swapped={swapped}
      className="relative inline-grid transition-colors duration-200 ease-out data-[swapped=true]:text-primary-text"
      onPointerEnter={(event) => event.pointerType === "mouse" && show(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && show(false)}
      onPointerUp={(event) => event.pointerType !== "mouse" && show(!swapped)}
    >
      <span className="sr-only">{name}</span>
      {/* Mede a largura do nome mais comprido para o título não mexer durante a troca. */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {name}
      </span>
      <span ref={visual} data-name-visual aria-hidden="true" className="col-start-1 row-start-1">
        {name}
      </span>
    </span>
  );
}
