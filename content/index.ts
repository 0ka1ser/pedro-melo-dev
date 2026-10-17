import type { Locale } from "@/lib/i18n";
import type { SiteContent } from "./types";
import { en } from "./en";
import { pt } from "./pt";

const content: Record<Locale, SiteContent> = { pt, en };

export function getContent(lang: Locale): SiteContent {
  return content[lang];
}
