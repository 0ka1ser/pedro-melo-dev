import { expect, test } from "@playwright/test";

test("seletor de idioma mantém a seção atual", async ({ page }) => {
  await page.goto("/pt#contato");
  await page.getByRole("link", { name: "Read in English" }).click();
  await expect(page).toHaveURL(/\/en#contato$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("links da navegação levam às seções", async ({ page, isMobile }) => {
  await page.goto("/pt");
  if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("link", { name: "Experiência" }).first().click();
  await expect(page).toHaveURL(/#experiencia$/);
  await expect(page.locator("#experiencia")).toBeInViewport();
});

test("menu mobile fecha com Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "menu recolhível só no mobile");
  await page.goto("/pt");
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
