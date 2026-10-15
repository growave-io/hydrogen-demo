# Shopify Hydrogen development

This storefront is scaffolded from Shopify's Hydrogen skeleton template.

Use the [Shopify AI Toolkit](https://shopify.dev/docs/apps/build/ai-toolkit) for all Shopify API and platform work. If missing, install it in the agent host per that page (or `npx skills add Shopify/shopify-ai-toolkit --list` for skill-compatible hosts).

## Growave integration

- SDK setup lives in `app/components/growave/GrowaveSetup.tsx` (init, URL builder, cart repository, customer authentication) and `app/root.tsx` (config, customer signature). The CSP is in `app/entry.server.tsx`. The cart routes are `app/routes/api.*.tsx`, with the cart adapter in `app/lib/growave.ts`.
- Keep code next to its only consumer, so a reader sees the integration where it happens. Move it to `app/lib/` only when several files share it.
- Render widgets with `@growave-io/react-sdk` components when one exists, otherwise with the placeholders in `app/components/growave/GrowaveWidgets.tsx`. Follow the Growave docs: https://docs.growave.io/docs/Sdk/
- Add new example pages to the header menu in `app/components/layout/Header.tsx`; the store's Shopify menu isn't used.
- Wrap every Growave block in `IntegrationSection` and describe it in `app/integrations/`. The `code` string there is written by hand, so update it whenever the block's code changes.
- Store profiles live in `envs/<store>.env`; run with `STORE=<store> npm run dev` (`demo` by default). Profiles set `SALES_CHANNEL` to `headless` or `hydrogen`; start from `envs/headless_example.env` or `envs/hydrogen_example.env`. Never commit a profile other than `envs/headless_example.env`, `envs/hydrogen_example.env` and `envs/demo.env`.
