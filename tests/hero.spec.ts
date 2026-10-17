import { expect, test } from "@playwright/test";

test("hero não corta texto no celular", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const lang of ["pt", "en"]) {
    await page.goto(`/${lang}`);
    const width = await page.evaluate(() => document.documentElement.clientWidth);
    for (const selector of ["h1", "#inicio p"]) {
      const box = await page.locator(selector).first().boundingBox();
      expect(box, `${lang} ${selector}`).not.toBeNull();
      expect(box!.x + box!.width, `${lang} ${selector}`).toBeLessThanOrEqual(width);
    }
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll, `${lang} sem rolagem horizontal`).toBeLessThanOrEqual(width);
  }
});

test("nome real é o texto acessível do título", async ({ page }) => {
  await page.goto("/pt");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(/Pedro Melo/);
});

test("as 9 seções existem nos dois idiomas", async ({ page }) => {
  for (const lang of ["pt", "en"]) {
    await page.goto(`/${lang}`);
    for (const id of ["inicio", "destaque", "como-trabalho", "experiencia", "stack", "projetos", "kaiserinc", "servicos", "contato"]) {
      await expect(page.locator(`#${id}`), `${lang}#${id}`).toHaveCount(1);
    }
  }
});

test("carrossel fica parado com movimento reduzido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/pt#stack");
  const name = await page.locator("[data-marquee-track]").evaluate((el) => getComputedStyle(el).animationName);
  expect(name).toBe("none");
});

test("CV do idioma está disponível", async ({ request }) => {
  const r = await request.get("/cv-pedro-melo-pt.pdf");
  expect(r.status()).toBe(200);
});
