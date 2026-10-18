import { expect, test, type Page } from "@playwright/test";

// A foto avisa quando terminou de carregar e hidratar; antes disso cliques e hovers se perdem.
const hidratado = (page: Page) =>
  page.waitForFunction(() => document.querySelector<HTMLElement>("[data-avatar-canvas]")?.dataset.ready === "true");

const html = (page: Page) => page.locator("html");
const temaEscuro = (page: Page) => html(page).evaluate((el) => el.classList.contains("dark"));

test.describe("troca de tema", () => {
  test("botão alterna o tema e a escolha persiste ao recarregar", async ({ page }) => {
    await page.goto("/pt");
    await hidratado(page);
    const botao = page.getByRole("button", { name: "Alternar tema" });
    const antes = await temaEscuro(page);
    await botao.click();
    await expect.poll(() => temaEscuro(page)).toBe(!antes);
    await page.reload();
    await hidratado(page);
    expect(await temaEscuro(page)).toBe(!antes);
  });

  test("o nome do botão vem do idioma da página", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("button", { name: "Toggle theme" })).toBeVisible();
  });

  test("a troca usa a varredura diagonal (View Transition com clip-path)", async ({ page }) => {
    await page.goto("/pt");
    await hidratado(page);
    await page.getByRole("button", { name: "Alternar tema" }).click();
    const varredura = await page.evaluate(
      () =>
        new Promise<boolean>((resolve) => {
          const start = performance.now();
          const tick = () => {
            const animations = document.documentElement.getAnimations({ subtree: true });
            const achou = animations.some((a) => {
              const effect = a.effect as KeyframeEffect | null;
              return effect?.pseudoElement === "::view-transition-new(root)" && effect.getKeyframes().some((k) => "clipPath" in k);
            });
            if (achou) resolve(true);
            else if (performance.now() - start > 1500) resolve(false);
            else requestAnimationFrame(tick);
          };
          tick();
        }),
    );
    expect(varredura).toBe(true);
  });

  test("com movimento reduzido troca com fade, sem varredura", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/pt");
    await hidratado(page);
    const antes = await temaEscuro(page);
    await page.getByRole("button", { name: "Alternar tema" }).click();
    await expect.poll(() => temaEscuro(page)).toBe(!antes);
    const comClip = await page.evaluate(() =>
      document.documentElement.getAnimations({ subtree: true }).some((a) => {
        const effect = a.effect as KeyframeEffect | null;
        return effect?.getKeyframes().some((k) => "clipPath" in k);
      }),
    );
    expect(comClip).toBe(false);
  });
});

test.describe("botão de contato (FlowButton)", () => {
  test("é um link para o contato, com duas setas, e continua pílula no hover", async ({ page, isMobile }) => {
    test.skip(isMobile, "o botão fica no menu no mobile");
    await page.goto("/pt");
    await hidratado(page);
    const link = page.locator("header").getByRole("link", { name: "Contato" });
    await expect(link).toHaveAttribute("href", "#contato");
    expect(await link.locator("svg").count()).toBe(2);
    const raio = () => link.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
    const meia = (await link.boundingBox())!.height / 2;
    expect(await raio()).toBeGreaterThanOrEqual(meia - 0.5); // pílula em repouso
    await link.hover();
    await page.waitForTimeout(900);
    expect(await raio()).toBeGreaterThanOrEqual(meia - 0.5); // e continua pílula no hover
  });

  test("sem cor fixa no componente", async () => {
    const { readFileSync } = await import("node:fs");
    const fonte = readFileSync("components/ui/flow-button.tsx", "utf-8");
    expect(fonte).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});

test.describe("guias de seção", () => {
  test("linhas, marcas e faixa hachurada aparecem no desktop", async ({ page, isMobile }) => {
    test.skip(isMobile, "guias verticais só em telas largas");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    expect(await page.locator("[data-guide-line]:visible").count()).toBeGreaterThanOrEqual(2);
    expect(await page.locator("[data-guide-plus]:visible").count()).toBeGreaterThanOrEqual(4);
    expect(await page.locator("[data-guide-band]").count()).toBeGreaterThanOrEqual(1);
  });

  test("as linhas verticais ficam nas bordas da coluna de conteúdo", async ({ page, isMobile }) => {
    test.skip(isMobile, "guias verticais só em telas largas");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    const xs = await page.locator("[data-guide-line]:visible").evaluateAll((els) => [...new Set(els.map((el) => Math.round(el.getBoundingClientRect().x)))]);
    expect(xs.sort((a, b) => a - b)).toEqual([208, 1232]); // 720 ± 512 (32rem, metade de max-w-5xl)
  });

  test("no celular não há guias verticais nem rolagem horizontal", async ({ page, isMobile }) => {
    test.skip(!isMobile, "só no mobile");
    await page.goto("/pt");
    expect(await page.locator("[data-guide-line]:visible").count()).toBe(0);
    const { scroll, largura } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, largura: document.documentElement.clientWidth }));
    expect(scroll).toBeLessThanOrEqual(largura);
  });

  test("guias são decorativas: escondidas dos leitores de tela", async ({ page }) => {
    await page.goto("/pt");
    const expostas = await page.locator("[data-guide-line], [data-guide-plus], [data-guide-band]").evaluateAll((els) => els.filter((el) => !el.closest("[aria-hidden='true']")).length);
    expect(expostas).toBe(0);
  });
});

test.describe("indicador de seção", () => {
  test("lista as 9 seções, marca a atual e leva até elas", async ({ page }) => {
    await page.goto("/pt");
    await hidratado(page);
    const rail = page.getByRole("navigation", { name: "Seções" });
    await expect(rail.getByRole("link")).toHaveCount(9);
    await expect(rail.locator("[aria-current='true']")).toHaveCount(1);
    await rail.getByRole("link", { name: "Contato" }).click();
    await expect(page).toHaveURL(/#contato$/);
    await expect(rail.getByRole("link", { name: "Contato" })).toHaveAttribute("aria-current", "true");
  });

  const opacidade = (page: Page, nome: string) =>
    page.getByRole("navigation", { name: "Seções" }).getByRole("link", { name: nome }).locator("[data-rail-label]").evaluate((el) => parseFloat(getComputedStyle(el).opacity));
  const larguraTick = (page: Page, nome: string) =>
    page.getByRole("navigation", { name: "Seções" }).getByRole("link", { name: nome }).locator("[data-rail-tick]").evaluate((el) => el.getBoundingClientRect().width);

  test("recolhido mostra só as marcas; ao passar o mouse mostra o nome de cada seção", async ({ page, isMobile }) => {
    test.skip(isMobile, "rótulos só com mouse");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    await hidratado(page);
    await expect.poll(() => opacidade(page, "Stack")).toBe(0);
    await page.getByRole("navigation", { name: "Seções" }).getByRole("link", { name: "Stack" }).hover();
    await expect.poll(() => opacidade(page, "Stack"), { timeout: 3000 }).toBe(1);
    await expect.poll(() => opacidade(page, "Contato"), { timeout: 3000 }).toBe(1);
    await page.mouse.move(300, 300);
    await expect.poll(() => opacidade(page, "Stack"), { timeout: 3000 }).toBe(0);
  });

  test("a marca sob o mouse cresce mais que as vizinhas e as distantes", async ({ page, isMobile }) => {
    test.skip(isMobile, "rótulos só com mouse");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    await hidratado(page);
    await page.getByRole("navigation", { name: "Seções" }).getByRole("link", { name: "Stack" }).hover();
    await page.waitForTimeout(500);
    const embaixo = await larguraTick(page, "Stack");
    const vizinha = await larguraTick(page, "Projetos");
    const distante = await larguraTick(page, "Contato");
    expect(embaixo).toBeGreaterThan(vizinha);
    expect(vizinha).toBeGreaterThan(distante);
  });

  test("o destaque do hover muda a cor do nome; a seção atual também fica destacada", async ({ page, isMobile }) => {
    test.skip(isMobile, "rótulos só com mouse");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    await hidratado(page);
    const cor = (nome: string) =>
      page.getByRole("navigation", { name: "Seções" }).getByRole("link", { name: nome }).locator("[data-rail-label]").evaluate((el) => getComputedStyle(el).color);
    await page.getByRole("navigation", { name: "Seções" }).getByRole("link", { name: "Stack" }).hover();
    await page.waitForTimeout(500);
    const hover = await cor("Stack");
    const outra = await cor("Serviços");
    const atual = await cor("Pedro Melo");
    expect(hover).not.toBe(outra);
    expect(atual).toBe(hover);
  });

  test("teclado: foco numa marca abre os nomes", async ({ page, isMobile }) => {
    test.skip(isMobile, "rótulos só com mouse");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    await hidratado(page);
    await page.getByRole("navigation", { name: "Seções" }).getByRole("link", { name: "Stack" }).focus();
    await expect.poll(() => opacidade(page, "Stack"), { timeout: 3000 }).toBe(1);
  });

  // Geometria do indicador no desktop: caixa da lista de marcas.
  const lista = async (page: Page) => (await page.getByRole("navigation", { name: "Seções" }).locator("ul").boundingBox())!;
  const aberto = (page: Page) => page.getByRole("navigation", { name: "Seções" }).getAttribute("data-open");

  test("a área de hover é larga: abre com o mouse bem à esquerda das marcas e também acima e abaixo", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover só com mouse");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    await hidratado(page);
    const caixa = await lista(page);
    const meio = caixa.y + caixa.height / 2;
    await page.mouse.move(1440 - 250, meio, { steps: 4 });
    await expect.poll(() => aberto(page)).toBe("true");
    await page.mouse.move(1440 - 250, caixa.y - 30, { steps: 4 });
    await expect.poll(() => aberto(page)).toBe("true");
    await page.mouse.move(1440 - 250, caixa.y + caixa.height + 30, { steps: 4 });
    await expect.poll(() => aberto(page)).toBe("true");
    await page.mouse.move(1440 - 320, meio, { steps: 4 });
    await expect.poll(() => aberto(page)).toBe("false");
    await page.mouse.move(1440 - 250, caixa.y + caixa.height + 120, { steps: 4 });
    await expect.poll(() => aberto(page)).toBe("false");
  });

  test("as linhas são contíguas, sem espaço morto entre elas", async ({ page, isMobile }) => {
    test.skip(isMobile, "só no desktop");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    const caixas = await page.getByRole("navigation", { name: "Seções" }).getByRole("link").evaluateAll((els) => els.map((el) => el.getBoundingClientRect()).map((r) => ({ top: r.top, bottom: r.bottom })));
    for (let i = 1; i < caixas.length; i++) expect(Math.abs(caixas[i].top - caixas[i - 1].bottom)).toBeLessThan(0.6);
  });

  test("o destaque segue a altura do mouse, pela linha mais próxima", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover só com mouse");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    await hidratado(page);
    const caixa = await lista(page);
    const linha = caixa.height / 9;
    const destacado = () =>
      page.getByRole("navigation", { name: "Seções" }).getByRole("link").evaluateAll((els) => els.findIndex((el) => el.getAttribute("data-hover") === "true"));
    // fora do alvo da linha 5: no limite com a 6, um pouco acima do centro da divisa
    await page.mouse.move(1440 - 250, caixa.y + linha * 4.5, { steps: 4 });
    await expect.poll(destacado).toBe(4);
    await page.mouse.move(1440 - 250, caixa.y + linha * 6 - 2, { steps: 3 });
    await expect.poll(destacado).toBe(5);
    await page.mouse.move(1440 - 250, caixa.y + linha * 6 + 2, { steps: 3 });
    await expect.poll(destacado).toBe(6);
    await page.mouse.move(1440 - 250, caixa.y - 20, { steps: 3 });
    await expect.poll(destacado).toBe(0);
  });

  test("as marcas fluem: a largura passa por muitos valores intermediários, sem saltos", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover só com mouse");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    await hidratado(page);
    const caixa = await lista(page);
    const linha = caixa.height / 9;
    await page.mouse.move(1440 - 250, caixa.y + linha * 1.5, { steps: 4 });
    await page.waitForTimeout(600);
    const amostras = page.evaluate(
      () =>
        new Promise<number[]>((resolve) => {
          const tick = document.querySelectorAll("[data-rail-tick]")[4] as HTMLElement;
          const out: number[] = [];
          const start = performance.now();
          const loop = () => {
            out.push(Math.round(tick.getBoundingClientRect().width * 10) / 10);
            if (performance.now() - start < 700) requestAnimationFrame(loop);
            else resolve(out);
          };
          loop();
        }),
    );
    await page.mouse.move(1440 - 250, caixa.y + linha * 4.5, { steps: 2 });
    const larguras = await amostras;
    const distintas = new Set(larguras);
    expect(distintas.size).toBeGreaterThan(6);
    const maiorSalto = Math.max(...larguras.slice(1).map((v, i) => Math.abs(v - larguras[i])));
    expect(maiorSalto).toBeLessThan(15);
  });

  test("clicar em qualquer ponto da linha, inclusive no nome, leva à seção", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover só com mouse");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    await hidratado(page);
    const link = page.getByRole("navigation", { name: "Seções" }).getByRole("link", { name: "Stack" });
    const caixa = (await link.boundingBox())!;
    await page.mouse.move(caixa.x + caixa.width - 5, caixa.y + caixa.height / 2, { steps: 4 });
    await expect.poll(() => aberto(page)).toBe("true");
    const nome = (await link.locator("[data-rail-label]").boundingBox())!;
    await page.mouse.click(nome.x + nome.width / 2, nome.y + nome.height / 2);
    await expect(page).toHaveURL(/#stack$/);
  });

  test("em /en o nome e os rótulos vêm do inglês", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Contact" })).toBeVisible();
  });

  test("no celular fica reduzido e não passa sobre o texto", async ({ page, isMobile }) => {
    test.skip(!isMobile, "só no mobile");
    await page.goto("/pt");
    const caixa = (await page.getByRole("navigation", { name: "Seções" }).boundingBox())!;
    expect(caixa.width).toBeLessThanOrEqual(16);
    const largura = page.viewportSize()!.width;
    expect(caixa.x + caixa.width).toBeLessThanOrEqual(largura);
    expect(caixa.x).toBeGreaterThanOrEqual(largura - 16);
  });
});

test.describe("scrollbar personalizada (como no ResenhARK)", () => {
  // Cor de um token, serializada pelo próprio navegador, para comparar com o que a scrollbar usa.
  const tokenComoCor = (page: Page, token: string) =>
    page.evaluate((nome) => {
      const probe = document.createElement("span");
      probe.style.color = `var(${nome})`;
      document.body.append(probe);
      const cor = getComputedStyle(probe).color;
      probe.remove();
      return cor;
    }, token);
  const barra = (page: Page) =>
    page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return { largura: style.scrollbarWidth, cor: style.scrollbarColor };
    });

  test("fina, com trilho transparente e polegar no token --border-strong", async ({ page }) => {
    await page.goto("/pt");
    const { largura, cor } = await barra(page);
    expect(largura).toBe("thin");
    expect(cor.startsWith(await tokenComoCor(page, "--border-strong"))).toBe(true);
    expect(cor).toMatch(/(transparent|rgba\(0, 0, 0, 0\))$/);
  });

  test("troca com o tema: segue o token do tema claro", async ({ page }) => {
    await page.goto("/pt");
    await page.evaluate(() => document.documentElement.classList.remove("dark"));
    const { cor } = await barra(page);
    expect(cor.startsWith(await tokenComoCor(page, "--border-strong"))).toBe(true);
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    const escuro = (await barra(page)).cor;
    expect(escuro).not.toBe(cor);
  });
});

test("rodapé centralizado na página", async ({ page }) => {
  await page.goto("/pt");
  const texto = page.locator("footer p");
  await texto.scrollIntoViewIfNeeded();
  expect(await texto.evaluate((el) => getComputedStyle(el).textAlign)).toBe("center");
  // o centro do texto visível (não da caixa) coincide com o centro da janela
  const centro = await texto.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const r = range.getBoundingClientRect();
    return r.left + r.width / 2;
  });
  const meio = (page.viewportSize()!.width - 0) / 2;
  expect(Math.abs(centro - meio)).toBeLessThan(8);
});

test.describe("botões do Hero (Flow Button)", () => {
  const raio = (el: import("@playwright/test").Locator) => el.evaluate((n) => parseFloat(getComputedStyle(n).borderTopLeftRadius));

  test("Ver projetos é um flow button com setas e leva ao destaque", async ({ page, isMobile }) => {
    await page.goto("/pt");
    await hidratado(page);
    const link = page.locator("#inicio").getByRole("link", { name: "Ver projetos" });
    await expect(link).toHaveAttribute("href", "#destaque");
    expect(await link.locator("svg").count()).toBe(2);
    if (isMobile) return;
    const meia = (await link.boundingBox())!.height / 2;
    expect(await raio(link)).toBeGreaterThanOrEqual(meia - 0.5); // pílula em repouso
    await link.hover();
    await page.waitForTimeout(900);
    expect(await raio(link)).toBeGreaterThanOrEqual(meia - 0.5); // e continua pílula no hover
  });

  test("Baixar currículo é um flow button de download", async ({ page, isMobile }) => {
    await page.goto("/pt");
    await hidratado(page);
    const botao = page.locator("#inicio").getByRole("button", { name: "Baixar currículo" });
    await expect(botao).toBeVisible();
    expect(await botao.locator("svg").count()).toBeGreaterThanOrEqual(2);
    if (isMobile) return;
    const meia = (await botao.boundingBox())!.height / 2;
    expect(await raio(botao)).toBeGreaterThanOrEqual(meia - 0.5); // pílula em repouso
    await botao.hover();
    await page.waitForTimeout(900);
    expect(await raio(botao)).toBeGreaterThanOrEqual(meia - 0.5); // e continua pílula no hover
  });

  test("clicar baixa o arquivo, mostra carregando e depois confirma", async ({ page }) => {
    await page.route("**/cv-pedro-melo-pt.pdf", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 900));
      await route.continue();
    });
    await page.goto("/pt");
    await hidratado(page);
    const botao = page.locator("#inicio").getByRole("button", { name: "Baixar currículo" });
    await expect(botao).toHaveAttribute("data-state", "idle");
    const baixou = page.waitForEvent("download");
    await botao.click();
    await expect(botao).toHaveAttribute("aria-busy", "true");
    await expect(botao).toHaveAttribute("data-state", "loading");
    expect((await baixou).suggestedFilename()).toBe("cv-pedro-melo-pt.pdf");
    await expect(botao).toHaveAttribute("data-state", "done", { timeout: 4000 });
    await expect(botao).toHaveAttribute("data-state", "idle", { timeout: 5000 });
    await expect(botao).not.toHaveAttribute("aria-busy", "true");
  });

  test("falha no download: avisa no idioma da página e não fica preso em carregando", async ({ page }) => {
    await page.route("**/cv-pedro-melo-pt.pdf", (route) => route.abort());
    await page.goto("/en");
    await hidratado(page);
    const botao = page.locator("#inicio").getByRole("button", { name: "Download résumé" });
    await botao.click();
    await expect(page.getByText("I couldn't download the résumé. Try again.")).toBeVisible();
    await expect(botao).toHaveAttribute("data-state", "idle");
    await expect(botao).not.toHaveAttribute("aria-busy", "true");
  });

  test("sem cor fixa nos componentes novos", async () => {
    const { readFileSync } = await import("node:fs");
    for (const arquivo of ["components/ui/flow-button.tsx", "components/site/DownloadButton.tsx"]) {
      expect(readFileSync(arquivo, "utf-8"), arquivo).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });
});

test.describe("flow button: a forma de pílula não muda", () => {
  test("o raio fica em metade da altura em todos os quadros do hover, sem saltos de forma", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover só com mouse");
    await page.goto("/pt");
    await hidratado(page);
    await page.mouse.move(5, 5);
    const alvo = "#inicio a[href='#destaque']";
    const caixa = (await page.locator(alvo).boundingBox())!;
    const amostras = page.evaluate(
      (seletor) =>
        new Promise<{ raio: number; altura: number }[]>((resolve) => {
          const el = document.querySelector(seletor) as HTMLElement;
          const out: { raio: number; altura: number }[] = [];
          const start = performance.now();
          const tick = () => {
            out.push({ raio: parseFloat(getComputedStyle(el).borderTopLeftRadius), altura: el.getBoundingClientRect().height });
            if (performance.now() - start < 900) requestAnimationFrame(tick);
            else resolve(out);
          };
          tick();
        }),
      alvo,
    );
    await page.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2, { steps: 3 });
    for (const { raio, altura } of await amostras) expect(raio).toBeGreaterThanOrEqual(altura / 2 - 0.5);
  });
});
