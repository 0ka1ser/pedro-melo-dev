# Desenvolvimento

Notas de setup para quem for mexer neste repositório. Não faz parte do README porque o README é
vitrine para quem visita o portfólio, não documentação de projeto.

## Stack

Next.js 16 (App Router, `proxy.ts`) · React 19 · TypeScript · Tailwind CSS v4 · KaiserInc Base
(registry `@kaiserinc`) · Resend · Zod · Playwright

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em <http://localhost:3000>, que redireciona para `/pt` ou `/en`.

```bash
npm run build       # build de produção
npm run lint        # eslint
npx tsc --noEmit    # tipos e conteúdo
npm test            # Playwright (desktop + mobile), sobe o servidor sozinho na porta 3000
```

Os testes precisam do navegador baixado uma vez: `npx playwright install chromium`.

### Variáveis de ambiente

Só `RESEND_API_KEY` é necessária, e apenas para o formulário de contato enviar email. Defina em
`.env.local`. Sem ela a rota `/api/contact` responde 503 em vez de fingir que enviou.
`NEXT_PUBLIC_SITE_URL` define o domínio nos metadados e no sitemap quando houver domínio próprio.

## Estrutura

```
app/
  [lang]/         layout, página e 404 por idioma (pt, en)
  api/contact/    rota do formulário
proxy.ts          redireciona / para /pt ou /en pelo Accept-Language
content/          todo o texto do site, tipado, em português e inglês
components/
  ui/             itens da registry @kaiserinc
  sections/       as 9 seções
  site/           nav, rodapé, seletor de idioma, efeitos
lib/              i18n, schema do formulário, url do site
tests/            Playwright
```

## Como ajustar o conteúdo

| Arquivo | O que controla |
| --- | --- |
| `content/types.ts` | o formato do conteúdo (`SiteContent`) |
| `content/pt.ts` | todo o texto em português |
| `content/en.ts` | todo o texto em inglês |

Os textos vêm do texto-base de Pedro Melo, no vault Ness-Brain. Um fato novo entra primeiro no
texto-base, depois em `pt.ts` e por fim em `en.ts`. Os dois arquivos satisfazem o mesmo tipo: uma
chave faltando em um idioma quebra o `tsc` e o build. Nenhum componente carrega texto fixo.

Cores, raios e tamanhos de controle vêm dos tokens do KaiserInc Base em `app/globals.css`. Componente
não usa cor fixa, só os tokens (`bg-background`, `text-primary-text`, `border-border`...).

Currículo: `public/cv-pedro-melo-pt.pdf`. O CV em inglês ainda não existe; `content/en.ts` aponta
para o PDF em português até lá.

## Deploy

Vercel, pela integração Git. Cadastre `RESEND_API_KEY` (e `NEXT_PUBLIC_SITE_URL`, se houver domínio
próprio) nas variáveis de ambiente do projeto. Cada push vira deploy; PRs ganham preview. O
`.vercelignore` deixa de fora `.dev-flow/`, `.env*` e os testes.
