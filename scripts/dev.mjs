import {spawn} from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {parseEnv} from 'node:util';

const PORT = process.env.PORT ?? '3081';
const REQUIRED_VARS = [
  'PUBLIC_STORE_DOMAIN',
  'PUBLIC_STOREFRONT_API_TOKEN',
  'SESSION_SECRET',
];
const LINK_FILE = '.shopify/project.json';
const FALLBACK_ENV_FILE = '.hydrogen/mock-shop.env';

const store = process.env.STORE;
const profileFile = store && `envs/${store}.env`;
const storeLinkFile = store && `envs/${store}.shopify.json`;

const profileError = getProfileError();
const args = ['hydrogen', 'dev', '--codegen', '--port', PORT];

if (profileError) {
  console.warn(
    `\n[hydrogen-demo] ${profileError} Falling back to mock.shop.\n`,
  );
  mkdirSync('.hydrogen', {recursive: true});
  writeFileSync(
    FALLBACK_ENV_FILE,
    `SESSION_SECRET="mock-shop"\nDEMO_PROFILE_ERROR="${profileError.replaceAll('"', '')}"\n`,
  );
  rmSync(LINK_FILE, {force: true});
  args.push('--env-file', FALLBACK_ENV_FILE);
} else {
  args.push('--env-file', profileFile);
  if (existsSync(storeLinkFile)) {
    mkdirSync('.shopify', {recursive: true});
    copyFileSync(storeLinkFile, LINK_FILE);
    args.push('--customer-account-push');
  } else {
    rmSync(LINK_FILE, {force: true});
    console.warn(
      `\n[hydrogen-demo] ${storeLinkFile} not found, customer login tunnel is off. Run \`STORE=${store} npm run store:link\` to enable it.\n`,
    );
  }
}

const child = spawn('shopify', [...args, ...process.argv.slice(2)], {
  stdio: 'inherit',
});
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});

function getProfileError() {
  if (!store) return 'No store profile selected (STORE is not set).';
  if (!existsSync(profileFile))
    return `Store profile ${profileFile} not found.`;

  const profile = parseEnv(readFileSync(profileFile, 'utf8'));
  const missing = REQUIRED_VARS.filter((name) => !profile[name]);
  if (missing.length) return `${profileFile} is missing ${missing.join(', ')}.`;

  return null;
}
