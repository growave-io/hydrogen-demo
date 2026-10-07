export type DemoNotice = {title: string; description: string};

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1'];

export function getDemoNotices(env: Env, request: Request): DemoNotice[] {
  if (!env.PUBLIC_STORE_DOMAIN) {
    return [
      {
        title: 'This demo is running on mock.shop',
        description: [
          env.DEMO_PROFILE_ERROR,
          'Growave widgets need your own Shopify store with Growave installed. Start the demo with STORE=<name> npm run dev, see "Connecting a store" in the README.',
        ]
          .filter(Boolean)
          .join(' '),
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
