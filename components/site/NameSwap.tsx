"use client";

import { useState } from "react";
import StrokeText from "@/components/ui/stroke-text";

// O nome é desenhado pelo StrokeText: no carregamento o contorno é traçado e o preenchimento entra
// em varredura. O hover é um gatilho: cada vez que o mouse entra, o texto troca e o desenho recomeça,
// de "Pedro Melo" para o apelido (em --primary-text) e de volta; sair não desfaz. No toque, tocar
// faz o mesmo. O nome real continua sendo o texto acessível.
export function NameSwap({ name, alias }: { name: string; alias: string }) {
  const [swapped, setSwapped] = useState(false);

  return (
    <span
      data-name-swap
      data-swapped={swapped}
      className="relative inline-block max-w-full align-top transition-colors duration-200 ease-out data-[swapped=true]:text-primary-text"
      onPointerEnter={(event) => event.pointerType === "mouse" && setSwapped((value) => !value)}
      onPointerUp={(event) => event.pointerType !== "mouse" && setSwapped((value) => !value)}
    >
      <span className="sr-only">{name}</span>
      <span aria-hidden="true" className="block">
        <StrokeText
          text={swapped ? alias : name}
          strokeColor="var(--primary-text)"
          strokeWidth={1.4}
          fontSize={52}
          fontWeight={600}
          letterSpacing={-1.3}
          drawDuration={1.1}
          fillDelay={0.1}
          stagger={0.04}
          style={{ width: "var(--stroke-text-width)", maxWidth: "100%" }}
        />
      </span>
    </span>
  );
}
