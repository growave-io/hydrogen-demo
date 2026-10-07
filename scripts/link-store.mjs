import {spawnSync} from 'node:child_process';
import {copyFileSync, existsSync, rmSync} from 'node:fs';

const LINK_FILE = '.shopify/project.json';
const store = process.env.STORE;

if (!store || !existsSync(`envs/${store}.env`)) {
  console.error(
    'Usage: STORE=<name> npm run store:link (envs/<name>.env must exist)',
  );
  process.exit(1);
}

rmSync(LINK_FILE, {force: true});
const {status} = spawnSync('shopify', ['hydrogen', 'link'], {stdio: 'inherit'});
if (status !== 0 || !existsSync(LINK_FILE)) process.exit(status || 1);

copyFileSync(LINK_FILE, `envs/${store}.shopify.json`);
console.log(`\nSaved the storefront link to envs/${store}.shopify.json`);
