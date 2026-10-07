# Hydrogen Demo

A minimal Shopify [Hydrogen](https://shopify.dev/docs/storefronts/headless/hydrogen) storefront styled with [shadcn/ui](https://ui.shadcn.com). It's the base for the Growave integration demo.

Stack: Hydrogen 2026.4 on React Router 7, React 19, Vite, Tailwind CSS v4 and shadcn/ui (Radix, `radix-nova` style).

## Getting started

Requires Node.js 22 or 24.

```bash
npm install
npm run dev  # http://localhost:3081
```

Without a store profile the demo runs on [mock.shop](https://mock.shop) data and shows a notice that Growave widgets are unavailable. To see Growave, connect a store that has Growave installed.

## Connecting a store

Each store gets its own profile in `envs/`. Every file there except `envs/example.env` is git-ignored.

1. Copy `envs/example.env` to `envs/<store>.env`, for example `envs/acme.env`.
2. Fill in `PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_API_TOKEN` and `SESSION_SECRET`. The token comes from the store admin: Sales channels → Headless or Hydrogen → your storefront → Storefront API.
3. Run `STORE=acme npm run dev`.

If the profile is missing or incomplete, the demo falls back to mock.shop and says why, both in the terminal and on the page.

### Customer login

Customer login uses the Customer Account API, which doesn't accept `localhost` and needs a public HTTPS domain.

- **Hydrogen sales channel.** Add the Customer Account variables to the profile, then link the storefront once with `STORE=acme npm run store:link`. That saves the link to `envs/acme.shopify.json`. From then on `STORE=acme npm run dev` starts a tunnel (`--customer-account-push`) and registers it with the store. Open the `tryhydrogen.dev` URL it prints.
- **Headless sales channel.** `--customer-account-push` only works with Hydrogen storefronts. Set up a tunnel yourself (for example ngrok) and add its URL to the Customer Account API settings in the store admin.

`npm run dev` copies the profile's link into `.shopify/project.json` and removes a link left over from another store, so link stores through `npm run store:link` rather than `shopify hydrogen link`.

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

- `npm run dev`: dev server on port 3081 (override with `PORT`) with GraphQL codegen; `STORE=<name>` selects `envs/<name>.env`
- `npm run store:link`: link the `STORE` profile to its Hydrogen storefront
- `npm run build`: production build for Oxygen
- `npm run typecheck`, `npm run lint`
