export function Footer({ note }: { note: string }) {
  return (
    <footer className="border-t border-border">
      <p className="mx-auto w-full max-w-5xl px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
        {note} · {new Date().getFullYear()}
      </p>
    </footer>
  );
}
