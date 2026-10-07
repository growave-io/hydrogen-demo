# Hydrogen Demo

A minimal Shopify [Hydrogen](https://shopify.dev/docs/storefronts/headless/hydrogen) storefront styled with [shadcn/ui](https://ui.shadcn.com). It's the base for the Growave integration demo.

Stack: Hydrogen 2026.4 on React Router 7, React 19, Vite, Tailwind CSS v4 and shadcn/ui (Radix, `radix-nova` style).

## Getting started

Requires Node.js 22 or 24.

```bash
npm install
cp .env.example .env
npm run dev  # http://localhost:3081
```

With no store linked, the app uses [mock.shop](https://mock.shop) data. Mock.shop only works with `npm run dev`. `npm run preview` needs a real store.

## Connecting a store

The store needs the Hydrogen (or Headless) sales channel installed.

```bash
npx shopify hydrogen link
npx shopify hydrogen env pull
```

Customer account login in local development needs a tunnel: `npm run dev -- --customer-account-push`.

## Pages

- Home: `/`
- Collections: `/collections`, `/collections/:handle`, `/collections/all`
- Product: `/products/:handle`
- Cart: `/cart` and the cart drawer
- Search: `/search` (products only)
- Account: `/account/*`

Blogs, pages and policies routes are intentionally left out.

## Theming

All theme values live in `app/styles/theme.css`:

- colors as oklch CSS variables under `:root` and `.dark`
- `--radius`
- `--font-body` and the font import

`app/styles/tailwind.css` maps these variables to Tailwind utilities through `@theme inline`. To change the theme, edit or replace `theme.css`. The components don't need to change.

A theme generated at [ui.shadcn.com/themes](https://ui.shadcn.com/themes) can replace the color `:root` and `.dark` blocks. The font block above them stays.

## Adding components

```bash
npx shadcn@latest add <component>
```

Components go into `app/components/ui`.

## Scripts

- `npm run dev`: dev server with GraphQL codegen
- `npm run build`: production build for Oxygen
- `npm run typecheck`, `npm run lint`
