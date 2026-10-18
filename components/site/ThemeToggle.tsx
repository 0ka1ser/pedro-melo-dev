"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

// Varredura diagonal: a borda inclinada ("/") cruza a tela da esquerda para a direita e o tema novo
// aparece atrás dela, como na referência. O polígono sai de fora da tela (-35%) e termina além da borda.
const WIPE = ["polygon(0% 0%, 0% 0%, -35% 100%, 0% 100%)", "polygon(0% 0%, 135% 0%, 100% 100%, 0% 100%)"];

export function ThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  function toggle() {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    // O DOM novo precisa existir quando a transição tira o "depois": troca a classe na hora e só então
    // deixa o next-themes guardar a escolha.
    const apply = () => {
      document.documentElement.classList.toggle("dark", next === "dark");
      setTheme(next);
    };
    if (!document.startViewTransition) return apply();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .startViewTransition(apply)
      .ready.then(() => {
        // D8: com movimento reduzido a mesma troca vira um fade curto, sem varredura.
        document.documentElement.animate(reduce ? { opacity: [0, 1] } : { clipPath: WIPE }, {
          duration: reduce ? 150 : 450,
          easing: "cubic-bezier(0.77, 0, 0.175, 1)",
          pseudoElement: "::view-transition-new(root)",
        });
      })
      .catch(() => undefined);
  }

  return (
    <Button variant="ghost" size="icon" aria-label={label} onClick={toggle}>
      <Sun aria-hidden="true" className="hidden dark:block" />
      <Moon aria-hidden="true" className="dark:hidden" />
    </Button>
  );
}
