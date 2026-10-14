import {spawn} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {z} from 'zod';

const required = z.string({error: 'Required'}).min(1, 'Required');
const optional = (schema) =>
  z.preprocess(
    (value) => (value === '' ? undefined : value),
    schema.optional(),
  );
const digits = z.string().regex(/^\d+$/, 'Expected digits');

const Options = z.object({
  STORE: optional(
    z.string().regex(/^[\w-]+$/, 'Use letters, digits, "-" and "_"'),
  ),
  PORT: z.coerce.number().int().min(1).max(65535).default(3081),
});

const storeDomain = z
  .string({error: 'Required'})
  .regex(
    /^[a-z0-9-]+\.myshopify\.com$/,
    'Expected the permanent *.myshopify.com domain',
  );
const growave = {
  PRIVATE_GROWAVE_API_SECRET: optional(z.string()),
  PUBLIC_GROWAVE_INSTAGRAM_GALLERY_ID: optional(digits),
};

const HeadlessProfile = z
  .object({
    SALES_CHANNEL: z.literal('headless'),
    PUBLIC_STORE_DOMAIN: storeDomain,
    PUBLIC_STOREFRONT_API_TOKEN: required,
    SESSION_SECRET: required,
    PUBLIC_CHECKOUT_DOMAIN: optional(
      z.string().regex(/^[a-z0-9.-]+$/, 'Expected a domain without https://'),
    ),
    PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: optional(z.string()),
    PUBLIC_CUSTOMER_ACCOUNT_API_URL: optional(z.url()),
    SHOP_ID: optional(digits),
    ...growave,
  })
  .refine(
    (profile) =>
      !profile.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID ===
      !profile.PUBLIC_CUSTOMER_ACCOUNT_API_URL,
    'Set PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID and PUBLIC_CUSTOMER_ACCOUNT_API_URL together',
  );

// Tokens, Customer Account API credentials and SESSION_SECRET come from the linked storefront.
const HydrogenProfile = z.object({
  SALES_CHANNEL: z.literal('hydrogen'),
  PUBLIC_STORE_DOMAIN: storeDomain,
  ...growave,
});

const Profile = z.discriminatedUnion(
  'SALES_CHANNEL',
  [HeadlessProfile, HydrogenProfile],
  {error: 'Set SALES_CHANNEL to "headless" or "hydrogen"'},
);

const LINK_FILE = '.shopify/project.json';

const {STORE, PORT} = parse(Options, process.env, 'STORE / PORT');
const envFile = `envs/${STORE ?? 'demo'}.env`;
if (!existsSync(envFile)) {
  fail(
    `${envFile} not found. Copy envs/headless_example.env or envs/hydrogen_example.env to create it.`,
  );
}
const env = parse(Profile, parseEnv(readFileSync(envFile, 'utf8')), envFile);

const args = ['hydrogen', 'dev', '--codegen', '--port', String(PORT)];
args.push('--env-file', envFile);

const linkedShop =
  existsSync(LINK_FILE) && JSON.parse(readFileSync(LINK_FILE, 'utf8')).shop;

if (env.SALES_CHANNEL === 'hydrogen') {
  if (linkedShop !== env.PUBLIC_STORE_DOMAIN) {
    fail(
      `${envFile} uses the Hydrogen channel, but the project is ${linkedShop ? `linked to ${linkedShop}` : 'not linked'}. Run \`npx shopify hydrogen link\` and pick ${env.PUBLIC_STORE_DOMAIN}.`,
    );
  }
  args.push('--customer-account-push');
} else if (linkedShop) {
  console.warn(
    `[hydrogen-demo] This project is linked to the Hydrogen storefront of ${linkedShop}, and its variables would be mixed into ${envFile}. Run \`npx shopify hydrogen unlink\`.`,
  );
}

spawn('shopify', [...args, ...process.argv.slice(2)], {stdio: 'inherit'}).on(
  'exit',
  (code) => process.exit(code ?? 0),
);

function parse(schema, input, source) {
  const result = schema.safeParse(input);
  if (!result.success) fail(`${source}\n${z.prettifyError(result.error)}`);
  return result.data;
}

function fail(message) {
  console.error(`[hydrogen-demo] ${message}`);
  process.exit(1);
}
