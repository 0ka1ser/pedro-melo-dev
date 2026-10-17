import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { Cursor } from "@/components/site/Cursor";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getContent } from "@/content";
import { hasLocale, locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import "../globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = getContent(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/${lang}`, languages: { "pt-BR": "/pt", en: "/en" } },
    openGraph: { type: "website", locale: lang === "en" ? "en_US" : "pt_BR", title: meta.title, description: meta.description },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const c = getContent(lang);
  return (
    <html
      lang={lang === "en" ? "en" : "pt-BR"}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn("antialiased font-sans", geist.variable, geistMono.variable)}
    >
      <body>
        <ThemeProvider>
          <Nav content={c.nav} brand={c.hero.name} />
          {children}
          <Footer note={c.footer.note} />
          <Cursor />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
