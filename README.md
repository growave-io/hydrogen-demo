# Hydrogen Demo

A minimal Shopify [Hydrogen](https://shopify.dev/docs/storefronts/headless/hydrogen) storefront that shows how to add [Growave](https://growave.io) widgets to a headless store with [`@growave-io/react-sdk`](https://www.npmjs.com/package/@growave-io/react-sdk). Every Growave block on the site has a "How it's built" marker with its code and a link to its documentation.

Stack: Hydrogen 2026.4 on React Router 7, React 19, Vite, Tailwind CSS v4 and shadcn/ui (Radix, `radix-nova` style).

## Quick start

Requires Node.js 22 or 24.

```bash
npm install
npm run dev  # http://localhost:3081
```

Without `STORE`, `npm run dev` uses `envs/demo.env`, which points at Growave's public demo store, so the widgets work right away. Customer login is off in this profile because it needs secrets; to try it, connect your own store as described below.

## Growave integration

The demo follows the [React SDK guide](https://docs.growave.io/docs/Sdk/react_sdk/) and the signed customer authentication from the [custom storefront guide](https://docs.growave.io/docs/Sdk/custom_storefront/). The integration code lives in these files:

- `app/root.tsx` builds the SDK config from the environment and, in its loader, signs the signed-in customer with `PRIVATE_GROWAVE_API_SECRET`.
- `app/components/GrowaveSetup.tsx` loads the Growave bundle after hydration, initializes the SDK, authenticates the signed-in customer and connects the cart widgets to the Hydrogen cart.
- `app/components/GrowaveWidgets.tsx` has the widget placeholders, plus the customization hook and style fixes that `app/root.tsx` puts in `<head>`.
- `app/routes/api.*.tsx` are the cart routes behind Growave's custom cart repository and discount strategy; `app/lib/growave.ts` adapts the Hydrogen cart for them.
- `app/entry.server.tsx` allows Growave's domains in the content security policy (`GROWAVE_CSP`).

## Running with your store

### What the store needs

- Growave installed, with the apps you want to see enabled.
- A storefront in the Headless or Hydrogen sales channel. The Hydrogen channel also gives you Oxygen hosting.
- These Storefront API permissions on the storefront: `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory` and `unauthenticated_read_product_tags`. Without the inventory permission, widgets that show products stay empty.

### Store profile

Each store gets its own profile in `envs/`, and the profile names the sales channel in `SALES_CHANNEL`.

|                           | Headless                                                                                                   | Hydrogen                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Start from                | `envs/headless_example.env`                                                                                | `envs/hydrogen_example.env`               |
| You fill in               | the domain, the Storefront API token and `SESSION_SECRET`; for login, the Customer Account API credentials | only the domain                           |
| Where the rest comes from | the profile holds everything                                                                               | Oxygen, the linked storefront's variables |
| Customer login tunnel     | `npm run tunnel`, URLs registered by hand                                                                  | started and registered by `npm run dev`   |

1. Copy the example for your channel to `envs/<store>.env` (git-ignored), for example `envs/acme.env`, and fill it in. Each example explains where every value comes from.
2. For the Hydrogen channel, link the project to the store's storefront once: `npx shopify hydrogen link`. The link belongs to the project, not to a profile; to switch stores, run `npx shopify hydrogen unlink` or link the other store.
3. Start the demo with the profile:

```bash
STORE=acme npm run dev
```

Variables a profile can set:

| Variable                                                                              | Headless   | Hydrogen    | Notes                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------- | ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SALES_CHANNEL`                                                                       | `headless` | `hydrogen`  | Selects how the profile is validated and started.                                                                                                                                                                                                                                           |
| `PUBLIC_STORE_DOMAIN`                                                                 | required   | required    | The permanent `*.myshopify.com` domain the store was created with (Settings → Domains). Growave looks the shop up by it, so a renamed domain doesn't work. For Hydrogen it has to match the linked store.                                                                                   |
| `PUBLIC_STOREFRONT_API_TOKEN`, `SESSION_SECRET`                                       | required   | from Oxygen | `SESSION_SECRET` is any random string, for example `openssl rand -hex 32`.                                                                                                                                                                                                                  |
| `PRIVATE_STOREFRONT_API_TOKEN`                                                        | optional   | from Oxygen |                                                                                                                                                                                                                                                                                             |
| `PUBLIC_CHECKOUT_DOMAIN`                                                              | optional   | optional    | The domain checkout runs on, usually the primary domain (Settings → Domains). Hydrogen's analytics and cookie consent use it; without it every page logs `consent.checkoutDomain is required`. Oxygen doesn't provide it, so for Hydrogen add it to the storefront's environment variables. |
| `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`, `PUBLIC_CUSTOMER_ACCOUNT_API_URL`, `SHOP_ID` | for login  | from Oxygen | See [Customer login](#customer-login).                                                                                                                                                                                                                                                      |
| `PRIVATE_GROWAVE_API_SECRET`                                                          | for login  | for login   | Growave admin → Settings → API. Server-only. Signs logged-in customers for Growave; without it they stay guests in the widgets.                                                                                                                                                             |
| `PUBLIC_GROWAVE_INSTAGRAM_GALLERY_ID`                                                 | optional   | optional    | Growave admin → Instagram. Without it the Instagram galleries are hidden.                                                                                                                                                                                                                   |

"From Oxygen" means the Shopify CLI loads the value from the linked Hydrogen storefront's environment variables (Hydrogen → your storefront → Storefront settings → Environments and variables) when `npm run dev` starts.

Before it starts, `npm run dev` checks `STORE`, `PORT` and the profile and lists anything to fix, such as an empty required variable or a renamed domain in place of the `*.myshopify.com` one. It also stops when a Hydrogen profile doesn't match the linked store, and warns when a Headless profile runs while the project is linked. Notices on the page tell you when customer login can't work yet.

### Customer login

Shopify's Customer Account API doesn't accept `localhost`, so signing in locally needs a public HTTPS URL. How you get one depends on the sales channel. Growave recognizes the signed-in customer only when `PRIVATE_GROWAVE_API_SECRET` is set, and then the guest's wishlist and referral carry over to the customer.

#### Headless sales channel

1. Fill in `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`, `PUBLIC_CUSTOMER_ACCOUNT_API_URL` (`https://shopify.com/<shop id>`) and `SHOP_ID` from Headless → your storefront → Customer Account API.
2. Start the store: `STORE=acme npm run dev`.
3. In a second terminal start a tunnel: `npm run tunnel`. It needs [ngrok](https://ngrok.com) installed and signed in.
4. The command prints three values. Add them in Headless → your storefront → Customer Account API → Application setup:
   - Callback URI: `https://<tunnel>/account/authorize`
   - JavaScript origin: `https://<tunnel>`
   - Logout URI: `https://<tunnel>`
5. Open the tunnel URL and sign in. ngrok shows a warning page first; click "Visit Site".

Without a fixed domain the tunnel URL changes on every run, and the three values have to be updated each time. A free ngrok account has one permanent dev domain (ngrok dashboard → Domains). Pass it with `TUNNEL_URL=https://<your-domain>.ngrok-free.app npm run tunnel` and you register the values only once.

#### Hydrogen sales channel

`STORE=acme npm run dev` starts a `*.tryhydrogen.dev` tunnel with `--customer-account-push` and registers its URLs with the linked storefront, so there's nothing to set up by hand. Open the tunnel URL from the terminal.

### Troubleshooting

- **Growave widgets stay empty, and the browser console shows `shop defined in querystring is not installed`.** `PUBLIC_STORE_DOMAIN` is not the store's permanent `*.myshopify.com` domain.
- **Product widgets stay empty with `Access denied for quantityAvailable`.** The storefront is missing the `unauthenticated_read_product_inventory` permission.
- **Port 3081 is busy.** Run with another port: `PORT=3090 STORE=acme npm run dev`, and the same `PORT` for `npm run tunnel`.
- **Signed in, but the widgets still treat you as a guest.** Check that `PRIVATE_GROWAVE_API_SECRET` is set in the profile and restart `npm run dev`.

## Running with Docker

The `Dockerfile` builds the app and serves it with `node-server.mjs`, a small Node server for hosting the storefront outside Oxygen. In the container it listens on port 8080 (`PORT`) and answers `/health` for load balancer checks.

```bash
docker build -t hydrogen-demo .
docker run --rm -p 8080:8080 -v "$PWD/envs/demo.env:/app/runtime.env:ro" hydrogen-demo
```

The server loads its variables from `/app/runtime.env`, so mounting a profile there is all the configuration it needs. `docker run --env-file` doesn't work with these profiles: Docker keeps the quotes around the values, and Node's env file parser removes them. Nothing loads variables from Oxygen here, so a Hydrogen profile needs every value filled in, the way a Headless profile has them.

To bake the configuration into the image, copy the profile to `runtime.env` next to the `Dockerfile` before `docker build`. The image then holds your secrets, so push it only to a private registry. `runtime.env` is git-ignored.

Behind a proxy or load balancer that terminates TLS, the server takes the protocol from `X-Forwarded-Proto`, so customer login redirects use `https`. Register the public URL in the Customer Account API settings as described in [Customer login](#customer-login).

The same server runs without Docker after a build: `npm run build`, then `node --env-file=envs/demo.env node-server.mjs` (port 3000 unless `PORT` is set).

## Scripts

- `npm run dev`: dev server on port 3081 (override with `PORT`) with GraphQL codegen; `STORE=<name>` selects `envs/<name>.env` (`demo` by default)
- `npm run tunnel`: ngrok tunnel for customer login with the Headless channel (`TUNNEL_URL`, `PORT`)
- `npm run build`: production build, used by Oxygen and by `node-server.mjs`
- `npm run start`: serves the production build with `node-server.mjs`, taking the variables from the environment (see [Running with Docker](#running-with-docker))
- `npm run typecheck`, `npm run lint`

## License

[MIT](LICENSE)
