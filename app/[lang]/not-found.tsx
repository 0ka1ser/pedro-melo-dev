import Link from "next/link";
import { getContent } from "@/content";

export default function NotFound() {
  const versions = [
    { lang: "pt", c: getContent("pt").notFound },
    { lang: "en", c: getContent("en").notFound },
  ] as const;
  return (
    <main className="mx-auto grid max-w-xl gap-10 px-4 py-32">
      {versions.map(({ lang, c }) => (
        <div key={lang} lang={lang === "en" ? "en" : "pt-BR"}>
          {lang === "pt" ? <h1 className="text-3xl font-semibold">{c.title}</h1> : <p className="text-3xl font-semibold">{c.title}</p>}
          <p className="mt-3 text-muted-foreground">{c.body}</p>
          <Link href={`/${lang}`} className="mt-4 inline-block text-primary-text underline-offset-4 hover:underline focus-visible:outline-solid focus-visible:outline-2">{c.back}</Link>
        </div>
      ))}
    </main>
  );
}
