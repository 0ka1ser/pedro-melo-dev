import { ArrowRight, type LucideIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

// Modelo "Flow Button" (21st.dev), adaptado ao KaiserInc Base: só tokens de cor, link ou botão, ícone
// trocável, estado de carregamento e movimento reduzido sem deslocamento (o círculo só aparece com fade).
// Fica sempre em pílula (a pedido de Kaiser, diferente do modelo, que vira retângulo no hover). O raio é
// finito e igual à metade da altura: `rounded-full` vale ~33 milhões de px e quebraria qualquer transição.
const arrow = "absolute z-[9] size-4 ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-[800ms] group-data-[busy=true]:opacity-0";
const sizes = {
  default: { box: "h-control rounded-[16px] px-6", circle: "group-hover:size-[180px] motion-reduce:size-[180px]" },
  lg: { box: "h-10 rounded-[20px] px-7", circle: "group-hover:size-[240px] motion-reduce:size-[240px]" },
} as const;

type FlowButtonProps = {
  children: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
  size?: keyof typeof sizes;
  /** Mostra o spinner no lugar das setas e bloqueia o botão enquanto a ação não termina. */
  busy?: boolean;
  /** Com `href` vira link; sem ele, botão. */
  href?: string;
  onClick?: () => void;
} & Record<`data-${string}`, string | undefined>;

export function FlowButton({ children, className, icon: Icon = ArrowRight, size = "default", busy = false, href, onClick, ...data }: FlowButtonProps) {
  const classes = cn(
    "group relative inline-flex items-center gap-1 overflow-hidden border-[1.5px] border-border-strong bg-transparent text-sm font-medium text-foreground transition-[border-color,color,scale] duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] outline-hidden hover:border-transparent hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.95] motion-reduce:duration-150 data-[busy=true]:pointer-events-none",
    sizes[size].box,
    className,
  );
  const content = (
    <>
      <Icon aria-hidden="true" className={cn(arrow, "left-[-25%] transition-[left,opacity] group-hover:left-3 motion-reduce:transition-none motion-reduce:group-hover:left-[-25%]")} />
      <span className="relative z-[1] -translate-x-2 transition-[translate,opacity] duration-[800ms] ease-out group-hover:translate-x-2 group-data-[busy=true]:opacity-50 motion-reduce:translate-x-0 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
        {children}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1/2 left-1/2 size-3 -translate-1/2 rounded-full bg-primary opacity-0 transition-[width,height,opacity] duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:opacity-100 motion-reduce:duration-150",
          sizes[size].circle,
        )}
      />
      <Icon aria-hidden="true" className={cn(arrow, "right-3 transition-[right,opacity] group-hover:right-[-25%] motion-reduce:transition-none motion-reduce:group-hover:right-3")} />
      {busy ? (
        <span aria-hidden="true" className="absolute inset-0 z-[10] flex items-center justify-center">
          <Spinner aria-hidden="true" role="presentation" aria-label={undefined} />
        </span>
      ) : null}
    </>
  );
  const shared = { className: classes, "data-busy": busy, "aria-busy": busy || undefined, ...data };
  return href ? (
    <a href={href} {...shared}>
      {content}
    </a>
  ) : (
    <button type="button" onClick={onClick} disabled={busy} {...shared}>
      {content}
    </button>
  );
}
