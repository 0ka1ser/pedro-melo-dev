import { expect, test, type Page } from "@playwright/test";

const VALIDA = {
  name: "Pedro Teste",
  email: "teste@exemplo.com",
  message: "Mensagem de teste com tamanho mais que suficiente.",
};

async function preencher(page: Page, dados = VALIDA) {
  await page.fill('input[name="name"]', dados.name);
  await page.fill('input[name="email"]', dados.email);
  await page.fill('textarea[name="message"]', dados.message);
}

const status = (page: Page) => page.locator('form [role="status"]');

test.describe("formulário de contato", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pt#contato");
  });

  test("bloqueia envio inválido sem chamar a API", async ({ page }) => {
    let chamou = false;
    page.on("request", (r) => {
      if (r.url().includes("/api/contact")) chamou = true;
    });

    await preencher(page, { name: "a", email: "invalido", message: "curto" });
    await page.click('button[type="submit"]');

    await expect(status(page)).toContainText("Informe seu nome");
    await expect(page.locator('input[name="name"]')).toHaveAttribute("aria-invalid", "true");
    expect(chamou).toBe(false);
  });

  test("confirma o envio e limpa o formulário", async ({ page }) => {
    await page.route("**/api/contact", (r) =>
      r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }),
    );

    await preencher(page);
    await page.click('button[type="submit"]');

    await expect(status(page)).toContainText("Mensagem enviada");
    await expect(page.locator('input[name="name"]')).toHaveValue("");
  });

  test("mostra a falha do servidor e oferece o email", async ({ page }) => {
    await page.route("**/api/contact", (r) =>
      r.fulfill({
        status: 502,
        contentType: "application/json",
        body: '{"error":"send_failed"}',
      }),
    );

    await preencher(page);
    await page.click('button[type="submit"]');

    await expect(status(page)).toContainText("Não consegui enviar");
    await expect(status(page).locator('a[href^="mailto:"]')).toBeVisible();
  });

  test("trata queda de rede", async ({ page }) => {
    await page.route("**/api/contact", (r) => r.abort());

    await preencher(page);
    await page.click('button[type="submit"]');

    await expect(status(page)).toContainText("Sem conexão");
  });

  test("desabilita o botão durante o envio", async ({ page }) => {
    await page.route("**/api/contact", async (r) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });

    await preencher(page);
    const botao = page.locator('button[type="submit"]');
    await botao.click();

    await expect(botao).toBeDisabled();
    await expect(botao).toContainText("Enviando");
  });
});

test.describe("erros traduzidos pelo idioma da página", () => {
  test("durante o envio em /en nada anuncia texto em português", async ({ page }) => {
    await page.goto("/en#contato");
    await page.route("**/api/contact", async (r) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });
    await preencher(page);
    await page.click('button[type="submit"]');
    await expect(page.locator('button[type="submit"]')).toContainText("Sending");
    // contagem pontual: toHaveCount(0) esperaria o spinner sumir e passaria sem provar nada
    const anunciados = await page.locator('form [aria-label="Carregando"]:not([aria-hidden="true"])').count();
    expect(anunciados).toBe(0);
  });

  test("erro aparece no idioma da página", async ({ page }) => {
    await page.goto("/en#contato");
    await page.route("**/api/contact", (r) =>
      r.fulfill({ status: 502, contentType: "application/json", body: '{"error":"send_failed"}' }),
    );
    await preencher(page);
    await page.click('button[type="submit"]');
    await expect(status(page)).toContainText("I couldn't send");
  });

  test("503 do servidor sem chave aparece no idioma da página", async ({ page }) => {
    await page.goto("/en#contato");
    await page.route("**/api/contact", (r) =>
      r.fulfill({ status: 503, contentType: "application/json", body: '{"error":"unavailable"}' }),
    );
    await preencher(page);
    await page.click('button[type="submit"]');
    await expect(status(page)).toContainText("Email is unavailable");
  });

  test("código desconhecido da API cai na mensagem genérica", async ({ page }) => {
    await page.goto("/pt#contato");
    await page.route("**/api/contact", (r) =>
      r.fulfill({ status: 500, contentType: "application/json", body: '{"error":"???"}' }),
    );
    await preencher(page);
    await page.click('button[type="submit"]');
    await expect(status(page)).toContainText("Não consegui enviar");
  });
});

function ipDeTeste() {
  return `203.0.113.${Math.floor(Math.random() * 250) + 1}`;
}

test.describe("rota /api/contact", () => {
  test("rejeita payload inválido", async ({ request }) => {
    const r = await request.post("/api/contact", {
      data: { name: "a", email: "nao-eh-email", message: "curto" },
      headers: { "x-forwarded-for": ipDeTeste() },
    });
    expect(r.status()).toBe(400);
    expect((await r.json()).error).toBe("invalid_name");
  });

  test("rejeita método não suportado", async ({ request }) => {
    const r = await request.get("/api/contact", {
      headers: { "x-forwarded-for": ipDeTeste() },
    });
    expect(r.status()).toBe(405);
  });

  test("falha alto quando não há chave configurada", async ({ request }) => {
    test.skip(!!process.env.RESEND_API_KEY, "há chave configurada — o envio é real");

    const r = await request.post("/api/contact", {
      data: VALIDA,
      headers: { "x-forwarded-for": ipDeTeste() },
    });
    expect(r.status()).toBe(503);
    expect((await r.json()).error).toBe("unavailable");
  });
});
