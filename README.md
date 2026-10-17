# Pedro Melo

Portfólio de Pedro Melo, engenheiro de software. Site em português (`/pt`) e inglês (`/en`), feito com
Next.js 16, Tailwind CSS v4 e o design system KaiserInc Base.

Sou engenheiro de software no GREat (UFC), onde atuo como Tech Lead num projeto de P&D com a Dell.
Desenho a arquitetura, priorizo o time e transformo protótipos em sistemas que a empresa consegue
manter. Fora dali, lanço produtos pela KaiserInc.

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. A raiz redireciona para `/pt` ou `/en` conforme o `Accept-Language` do
navegador, com português por padrão.

| Comando | O que faz |
|---|---|
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | checagem de tipos e de conteúdo |
| `npm run build` | build de produção |
| `npm test` | Playwright, desktop e mobile (usa a porta 3000) |

Para o formulário de contato enviar email, defina `RESEND_API_KEY` em `.env.local`. Sem a chave, a
rota `/api/contact` responde 503.

## Estrutura

```
app/
  [lang]/            layout, página e 404 por idioma
  api/contact/       rota do formulário (Resend)
proxy.ts             redireciona / para /pt ou /en
content/             types.ts, pt.ts, en.ts: todo texto do site
components/
  ui/                itens da registry @kaiserinc
  sections/          as 9 seções
  site/              nav, rodapé, seletor de idioma, efeitos
lib/                 i18n, schema do contato
tests/               Playwright: idioma, navegação, hero, contato
```

## Conteúdo

Os textos vêm do texto-base de Pedro Melo, no vault Ness-Brain. Um fato novo entra primeiro no
texto-base, depois em `content/pt.ts` e por fim em `content/en.ts`. Os dois arquivos seguem o mesmo
tipo (`SiteContent`): uma chave faltando em um idioma quebra o `tsc` e o build.

## Contato

- [github.com/pHenrymelo](https://github.com/pHenrymelo)
- [linkedin.com/in/phenrymelo](https://www.linkedin.com/in/phenrymelo)
- pedrohenriquebmelo25@gmail.com
