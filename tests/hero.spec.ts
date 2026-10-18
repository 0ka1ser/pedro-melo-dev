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

// A foto avisa quando terminou de carregar e hidratar; antes disso hover e toque se perdem.
const hidratado = (page: import("@playwright/test").Page) =>
  page.waitForFunction(() => document.querySelector<HTMLElement>("[data-avatar-canvas]")?.dataset.ready === "true");

test.describe("troca de nome", () => {
  const visual = '#inicio-title [data-name-visual]';

  async function trocar(page: import("@playwright/test").Page, isMobile: boolean) {
    const alvo = page.locator("#inicio-title [data-name-swap]");
    if (isMobile) await alvo.tap();
    else await alvo.hover();
  }

  async function sair(page: import("@playwright/test").Page, isMobile: boolean) {
    if (isMobile) await page.locator("#inicio-title [data-name-swap]").tap();
    else await page.mouse.move(2, 600);
  }

  test("vira Kaiser, volta para Pedro Melo e mantém o nome real acessível", async ({ page, isMobile }) => {
    await page.goto("/pt");
    await hidratado(page);
    await expect(page.locator(visual)).toHaveText("Pedro Melo");
    await trocar(page, isMobile);
    await expect(page.locator(visual)).toHaveText("Kaiser", { timeout: 4000 });
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(/Pedro Melo/);
    await sair(page, isMobile);
    await expect(page.locator(visual)).toHaveText("Pedro Melo", { timeout: 4000 });
  });

  test("passa por caracteres embaralhados no caminho", async ({ page, isMobile }) => {
    await page.goto("/pt");
    await hidratado(page);
    const amostras = page.evaluate(
      (selector) =>
        new Promise<string[]>((resolve) => {
          const el = document.querySelector(selector)!;
          const seen = new Set<string>();
          const start = performance.now();
          const tick = () => {
            seen.add(el.textContent ?? "");
            if (performance.now() - start < 1500) requestAnimationFrame(tick);
            else resolve([...seen]);
          };
          tick();
        }),
      visual,
    );
    await trocar(page, isMobile);
    const vistos = await amostras;
    expect(vistos.filter((texto) => texto !== "Pedro Melo" && texto !== "Kaiser").length).toBeGreaterThan(2);
  });

  test("com movimento reduzido a troca continua, mais curta", async ({ page, isMobile }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/pt");
    await hidratado(page);
    await trocar(page, isMobile);
    await expect(page.locator(visual)).toHaveText("Kaiser", { timeout: 1000 });
  });
});

test.describe("cursor personalizado", () => {
  const pintados = (page: import("@playwright/test").Page, x: number, y: number, raio: number) =>
    page.evaluate(
      ({ x, y, raio }) => {
        const canvas = document.querySelector<HTMLCanvasElement>("canvas[data-cursor]");
        if (!canvas) return -1;
        const ctx = canvas.getContext("2d")!;
        const k = canvas.width / window.innerWidth;
        const data = ctx.getImageData(
          Math.max(0, (x - raio) * k),
          Math.max(0, (y - raio) * k),
          raio * 2 * k,
          raio * 2 * k,
        ).data;
        let count = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 20) count++;
        return count;
      },
      { x, y, raio },
    );

  // O mouse pode mexer antes da hidratação; repete o movimento até o cursor ligar.
  const ligar = (page: import("@playwright/test").Page) =>
    expect(async () => {
      await page.mouse.move(300, 300);
      await page.mouse.move(520, 360, { steps: 6 });
      expect(await page.locator("html").getAttribute("data-custom-cursor")).toBe("on");
    }).toPass({ timeout: 8000 });

  test("desenha o anel de pontos junto do mouse e esconde o cursor nativo", async ({ page, isMobile }) => {
    test.skip(isMobile, "cursor só com mouse");
    await page.goto("/pt");
    await ligar(page);
    await expect.poll(() => pintados(page, 520, 360, 50), { timeout: 3000 }).toBeGreaterThan(20);
    expect(await pintados(page, 900, 700, 40)).toBe(0);
    const cursorDoLink = await page.getByRole("link", { name: "Ver projetos" }).evaluate((el) => getComputedStyle(el).cursor);
    expect(cursorDoLink).toBe("none");
  });

  // Lê o canvas numa janela em volta de (x, y): pixels pintados, caixa que os contém e cor média.
  const medir = (page: import("@playwright/test").Page, x: number, y: number, raio: number) =>
    page.evaluate(
      ({ x, y, raio }) => {
        const canvas = document.querySelector<HTMLCanvasElement>("canvas[data-cursor]")!;
        const k = canvas.width / window.innerWidth;
        const x0 = Math.max(0, Math.round((x - raio) * k));
        const y0 = Math.max(0, Math.round((y - raio) * k));
        const w = Math.round(raio * 2 * k);
        const data = canvas.getContext("2d")!.getImageData(x0, y0, w, w).data;
        let n = 0, minX = 1e9, maxX = -1, bg = 0, hash = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 60) continue;
          n++;
          const px = (i / 4) % w;
          minX = Math.min(minX, px);
          maxX = Math.max(maxX, px);
          bg += data[i + 2] - data[i + 1];
          hash = (hash * 31 + data[i + 3] + px) | 0;
        }
        return { n, largura: (maxX - minX + 1) / k, azulMenosVerde: n ? bg / n : 0, hash };
      },
      { x, y, raio },
    );

  test("é um pouco menor que o primeiro corte (anel de ~38px)", async ({ page, isMobile }) => {
    test.skip(isMobile, "cursor só com mouse");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/pt");
    await ligar(page);
    await page.mouse.move(900, 600);
    await expect.poll(async () => (await medir(page, 900, 600, 60)).n, { timeout: 3000 }).toBeGreaterThan(20);
    await page.waitForTimeout(500); // o anel entra com fade; mede só depois de assentar
    const { largura } = await medir(page, 900, 600, 60);
    expect(largura).toBeGreaterThan(30);
    expect(largura).toBeLessThan(46);
  });

  test("anima sozinho como fluido e gira no sentido horário", async ({ page, isMobile }) => {
    test.skip(isMobile, "cursor só com mouse");
    await page.goto("/pt");
    await ligar(page);
    await page.mouse.move(900, 600);
    await page.waitForTimeout(700);
    const canvas = page.locator("canvas[data-cursor]");
    const fases: number[] = [];
    const hashes = new Set<number>();
    for (let i = 0; i < 4; i++) {
      fases.push(Number(await canvas.getAttribute("data-spin")));
      hashes.add((await medir(page, 900, 600, 60)).hash);
      await page.waitForTimeout(220);
    }
    expect(hashes.size).toBeGreaterThan(2);
    for (let i = 1; i < fases.length; i++) expect(fases[i]).toBeGreaterThan(fases[i - 1]);
  });

  test("com movimento reduzido o anel fica parado", async ({ page, isMobile }) => {
    test.skip(isMobile, "cursor só com mouse");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/pt");
    await ligar(page);
    await page.mouse.move(900, 600);
    await page.waitForTimeout(600);
    const a = await medir(page, 900, 600, 60);
    await page.waitForTimeout(400);
    const b = await medir(page, 900, 600, 60);
    expect(b.hash).toBe(a.hash);
  });

  test("no hover de link troca para os tons de roxo da KaiserInc", async ({ page, isMobile }) => {
    test.skip(isMobile, "cursor só com mouse");
    await page.goto("/pt");
    await ligar(page);
    await page.mouse.move(900, 600);
    await expect.poll(async () => (await medir(page, 900, 600, 60)).n, { timeout: 3000 }).toBeGreaterThan(20);
    expect(Math.abs((await medir(page, 900, 600, 60)).azulMenosVerde)).toBeLessThan(15);
    const caixa = (await page.getByRole("link", { name: "Ver projetos" }).boundingBox())!;
    const cx = caixa.x + caixa.width / 2;
    const cy = caixa.y + caixa.height / 2;
    await page.mouse.move(cx, cy, { steps: 4 });
    await expect.poll(async () => (await medir(page, cx, cy, 60)).azulMenosVerde, { timeout: 3000 }).toBeGreaterThan(75);
  });

  test("no hover de link o anel cresce só um pouco", async ({ page, isMobile }) => {
    test.skip(isMobile, "cursor só com mouse");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/pt");
    await ligar(page);
    await page.mouse.move(900, 600);
    await expect.poll(async () => (await medir(page, 900, 600, 60)).n, { timeout: 3000 }).toBeGreaterThan(20);
    await page.waitForTimeout(500); // o anel entra com fade; mede só depois de assentar
    const repouso = (await medir(page, 900, 600, 60)).largura;
    const caixa = (await page.getByRole("link", { name: "Ver projetos" }).boundingBox())!;
    const cx = caixa.x + caixa.width / 2;
    const cy = caixa.y + caixa.height / 2;
    await page.mouse.move(cx, cy, { steps: 4 });
    await page.waitForTimeout(700);
    const crescimento = (await medir(page, cx, cy, 60)).largura - repouso;
    expect(crescimento).toBeGreaterThan(2);
    expect(crescimento).toBeLessThan(9);
  });

  test("em campo de texto usa o cursor nativo", async ({ page, isMobile }) => {
    test.skip(isMobile, "cursor só com mouse");
    await page.goto("/pt#contato");
    await ligar(page);
    const campo = page.locator('input[name="name"]');
    await campo.hover();
    await expect(page.locator("html")).toHaveAttribute("data-custom-cursor", "off");
    expect(await campo.evaluate((el) => getComputedStyle(el).cursor)).not.toBe("none");
  });

  test("no toque não liga o cursor", async ({ page, isMobile }) => {
    test.skip(!isMobile, "só no mobile");
    await page.goto("/pt");
    await page.locator("#inicio-title").tap();
    await expect(page.locator("html")).not.toHaveAttribute("data-custom-cursor", /on|off/);
  });
});

test.describe("troca da foto de perfil", () => {
  const avatar = "#inicio [data-avatar-swap]";
  const pronto = (page: import("@playwright/test").Page) =>
    page.waitForFunction(() => document.querySelector<HTMLElement>("[data-avatar-canvas]")?.dataset.ready === "true");

  test("só existem a foto de estúdio e o desenho", async ({ request }) => {
    for (const nome of ["personagem", "original"]) {
      const r = await request.get(`/avatar/${nome}.webp`);
      expect(r.status(), nome).toBe(200);
    }
    const removida = await request.get("/avatar/eu-fundo-branco.webp");
    expect(removida.status()).toBe(404);
  });

  test("começa no personagem", async ({ page }) => {
    await page.goto("/pt");
    await pronto(page);
    await expect(page.locator(avatar)).toHaveAttribute("data-shown", "0");
  });

  test("hover troca por mosaico para o desenho, clique não troca nada e sair volta", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover só com mouse");
    await page.goto("/pt");
    await pronto(page);
    const vistos = page.evaluate(
      (selector) =>
        new Promise<string[]>((resolve) => {
          const el = document.querySelector<HTMLElement>(selector)!;
          const seen = new Set<string>();
          const start = performance.now();
          const tick = () => {
            seen.add(el.dataset.shown ?? "");
            if (performance.now() - start < 2500) requestAnimationFrame(tick);
            else resolve([...seen]);
          };
          tick();
        }),
      avatar,
    );
    await page.locator(avatar).hover();
    await expect(page.locator(avatar)).toHaveAttribute("data-shown", "1", { timeout: 3000 });
    const durante = await vistos;
    expect(durante).toContain("mixed"); // mosaico: ladrilhos em estados diferentes ao mesmo tempo
    await page.locator(avatar).click();
    await page.waitForTimeout(1200);
    await expect(page.locator(avatar)).toHaveAttribute("data-shown", "1");
    await page.mouse.move(2, 700);
    await expect(page.locator(avatar)).toHaveAttribute("data-shown", "0", { timeout: 3000 });
  });

  test("em repouso é o Pedro; o personagem aparece no hover como easter egg", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover só com mouse");
    await page.goto("/pt");
    await pronto(page);
    await expect(page.locator(avatar)).toHaveAttribute("data-image", "/avatar/original.webp");
    await page.locator(avatar).hover();
    await expect(page.locator(avatar)).toHaveAttribute("data-image", "/avatar/personagem.webp", { timeout: 3000 });
    await page.mouse.move(2, 700);
    await expect(page.locator(avatar)).toHaveAttribute("data-image", "/avatar/original.webp", { timeout: 3000 });
  });

  test("no toque cada toque alterna entre a foto de estúdio e o desenho", async ({ page, isMobile }) => {
    test.skip(!isMobile, "toque só no mobile");
    await page.goto("/pt");
    await pronto(page);
    for (const esperado of ["1", "0", "1"]) {
      await page.locator(avatar).tap();
      await expect(page.locator(avatar)).toHaveAttribute("data-shown", esperado, { timeout: 3000 });
    }
  });

  test("com movimento reduzido a troca é bem mais curta", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover só com mouse");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/pt");
    await pronto(page);
    await page.locator(avatar).hover();
    await expect(page.locator(avatar)).toHaveAttribute("data-shown", "1", { timeout: 700 });
  });

  test("o nome acessível do botão é o alt da foto", async ({ page }) => {
    await page.goto("/pt");
    await expect(page.locator(avatar)).toHaveAccessibleName("Foto de Pedro Melo");
  });
});
