export const locales = ["pt", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// ponytail: parser simples de Accept-Language para 2 idiomas; trocar por @formatjs/intl-localematcher se entrar um terceiro.
export function pickLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { base: tag.split("-")[0], q: q ? Number(q.trim().slice(2)) : 1 };
    })
    .filter((item) => item.base && !Number.isNaN(item.q))
    .sort((a, b) => b.q - a.q);
  const hit = ranked.find((item) => hasLocale(item.base));
  return hit ? (hit.base as Locale) : defaultLocale;
}
