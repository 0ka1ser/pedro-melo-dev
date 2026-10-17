import { expect, test } from "@playwright/test";

const go = (accept: string | undefined): { maxRedirects: number; headers: Record<string, string> } => ({
  maxRedirects: 0,
  headers: accept ? { "accept-language": accept } : {},
});

test.describe("idioma", () => {
  test("raiz vai para /en quando o navegador prefere inglês", async ({ request }) => {
    for (const accept of ["en-US,en;q=0.9", "en-GB", "fr;q=0.9, en;q=0.8"]) {
      const r = await request.get("/", go(accept));
      expect(r.status(), accept).toBe(307);
      expect(r.headers()["location"], accept).toMatch(/\/en$/);
    }
  });

  test("raiz vai para /pt por padrão", async ({ request }) => {
    for (const accept of [undefined, "pt-BR,pt;q=0.9", "fr", "pt;q=0.9, en;q=0.8"]) {
      const r = await request.get("/", go(accept));
      expect(r.status(), String(accept)).toBe(307);
      expect(r.headers()["location"], String(accept)).toMatch(/\/pt$/);
    }
  });

  test("arquivos e API não passam pelo redirect", async ({ request }) => {
    for (const path of ["/avatar.jpg", "/favicon.ico"]) {
      const r = await request.get(path, { maxRedirects: 0 });
      expect(r.status(), path).not.toBe(307);
    }
    const api = await request.get("/api/contact", { maxRedirects: 0 });
    expect(api.status()).toBe(405);
  });

  test("cada idioma declara o próprio lang", async ({ page }) => {
    await page.goto("/pt");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("idioma desconhecido cai no 404", async ({ page }) => {
    const r = await page.goto("/xx");
    expect(r?.status()).toBe(404);
  });

  test("publica as duas versões para os buscadores", async ({ page }) => {
    await page.goto("/pt");
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", /\/en$/);
    await expect(page).toHaveTitle(/Pedro Melo/);
  });

  test("404 explica nos dois idiomas", async ({ page }) => {
    const r = await page.goto("/pt/nao-existe");
    expect(r?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("não existe");
    await expect(page.getByText("This page doesn't exist.")).toBeVisible();
  });
});
