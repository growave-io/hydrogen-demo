export type DemoNotice = {
  title: string;
  description: string;
  variant?: 'warning';
  command?: string;
  docs?: {label: string; href: string};
};

const CONNECTING_A_STORE_URL =
  'https://github.com/growave-io/hydrogen-demo#connecting-a-store';

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1'];

export function getDemoNotices(env: Env, request: Request): DemoNotice[] {
  if (!env.PUBLIC_STORE_DOMAIN) {
    return [
      {
        title: 'This demo is running on mock.shop',
        variant: 'warning',
        description: [
          env.DEMO_PROFILE_ERROR,
          'Growave widgets need your own Shopify store with Growave installed.',
        ]
          .filter(Boolean)
          .join(' '),
        command: 'STORE=<name> npm run dev',
        docs: {
          label: 'Connecting a store',
          href: CONNECTING_A_STORE_URL,
        },
      },
    ];
  }

  if (!env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID) {
    return [
      {
        title: 'Customer login is off',
        description:
          'PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID is not set in this store profile, so account pages and Growave features for logged-in customers are unavailable.',
      },
    ];
  }

  if (LOCAL_HOSTNAMES.includes(new URL(request.url).hostname)) {
    return [
      {
        title: 'Customer login needs the tunnel URL',
        description:
          'The Customer Account API does not accept localhost. Open the tryhydrogen.dev URL printed by npm run dev, or link a Hydrogen storefront with STORE=<name> npm run store:link.',
      },
    ];
  }

  return [];
}
