import {spawn} from 'node:child_process';

const {PORT = '3081', TUNNEL_URL} = process.env;
const args = ['http', PORT, '--log', 'stdout', '--log-format', 'logfmt'];
if (TUNNEL_URL) args.push('--url', TUNNEL_URL);

const ngrok = spawn('ngrok', args, {stdio: ['ignore', 'pipe', 'inherit']});
ngrok.on('exit', (code) => process.exit(code ?? 0));

ngrok.stdout.on('data', function printSettings(chunk) {
  const origin = String(chunk).match(/url=(https:\/\/\S+)/)?.[1];
  if (!origin) return;
  ngrok.stdout.off('data', printSettings);
  process.stdout.write(`
Tunnel: ${origin} → http://localhost:${PORT}

Add these in Shopify admin → Headless → your storefront → Customer Account API:
  Callback URI:      ${origin}/account/authorize
  JavaScript origin: ${origin}
  Logout URI:        ${origin}
`);
});
