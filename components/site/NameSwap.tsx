export function NameSwap({ name, alias }: { name: string; alias: string }) {
  return (
    <span className="group relative inline-grid">
      <span className="col-start-1 row-start-1 transition-[opacity,transform] duration-300 group-hover:-translate-y-2 group-hover:opacity-0 motion-reduce:group-hover:translate-y-0">
        {name}
      </span>
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1 translate-y-2 text-primary-text opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:translate-y-0"
      >
        {alias}
      </span>
    </span>
  );
}
