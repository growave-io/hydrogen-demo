import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

const GROWAVE_CSP = {
  defaultSrc: [
    'https://static.growave.io',
    'https://app.growave.io',
    'https://imgs.growave.io',
    'https://services.growave.io',
    'https://translations.growave.io',
    'https://js.hcaptcha.com',
    'https://sswfiles.s3.amazonaws.com',
  ],
  styleSrc: ['https://static.growave.io'],
  connectSrc: [
    'https://app.growave.io',
    'https://services.growave.io',
    'https://translations.growave.io',
    // Source maps of the Growave bundle, fetched by DevTools.
    'https://growave-private-files.s3.us-east-1.amazonaws.com',
  ],
};

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    ...GROWAVE_CSP,
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
