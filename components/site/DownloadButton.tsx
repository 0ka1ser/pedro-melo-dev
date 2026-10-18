"use client";

import { Check, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FlowButton } from "@/components/ui/flow-button";

// Baixa o arquivo com fetch para poder mostrar o estado de carregamento e confirmar no fim.
// ponytail: o carregamento fica visível por pelo menos MIN_LOADING ms; um arquivo local baixa tão rápido
// que o spinner piscaria sem o usuário perceber.
const MIN_LOADING = 600;
const DONE_FOR = 1800;

export function DownloadButton({ href, errorMessage, children }: { href: string; errorMessage: string; children: React.ReactNode }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const reset = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(reset.current), []);

  async function download() {
    if (state !== "idle") return;
    setState("loading");
    const started = performance.now();
    try {
      const response = await fetch(href);
      if (!response.ok) throw new Error(String(response.status));
      const url = URL.createObjectURL(await response.blob());
      const link = Object.assign(document.createElement("a"), { href: url, download: href.split("/").pop() });
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      await new Promise((resolve) => setTimeout(resolve, Math.max(0, MIN_LOADING - (performance.now() - started))));
      setState("done");
      reset.current = setTimeout(() => setState("idle"), DONE_FOR);
    } catch {
      toast.error(errorMessage);
      setState("idle");
    }
  }

  return (
    <FlowButton size="lg" icon={state === "done" ? Check : Download} busy={state === "loading"} onClick={download} data-state={state}>
      {children}
    </FlowButton>
  );
}
