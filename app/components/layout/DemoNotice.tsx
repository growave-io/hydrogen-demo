import {TriangleAlertIcon} from 'lucide-react';
import {useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';
import {Alert, AlertDescription, AlertTitle} from '~/components/ui/alert';

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1'];

export function getDemoNotice(env: Env, request: Request) {
  if (!env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID) {
    return {
      title: 'Customer login is off',
      description:
        'PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID is not set in this store profile, so account pages and Growave features for logged-in customers are unavailable.',
    };
  }

  if (!env.PRIVATE_GROWAVE_API_SECRET) {
    return {
      title: 'Customers stay guests in Growave widgets',
      description:
        'PRIVATE_GROWAVE_API_SECRET is not set in this store profile, so signed-in customers are not authenticated in Growave: no points balance, rewards history or personal wishlist.',
    };
  }

  if (LOCAL_HOSTNAMES.includes(new URL(request.url).hostname)) {
    return {
      title: 'Customer login needs the tunnel URL',
      description:
        'The Customer Account API does not accept localhost. Run npm run tunnel and open its URL (Headless channel), or link a Hydrogen storefront with npx shopify hydrogen link and open the tryhydrogen.dev URL.',
    };
  }

  return null;
}

export function DemoNotice() {
  const notice = useRouteLoaderData<RootLoader>('root')?.demoNotice;
  if (!notice) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
      <Alert>
        <TriangleAlertIcon />
        <AlertTitle>{notice.title}</AlertTitle>
        <AlertDescription>{notice.description}</AlertDescription>
      </Alert>
    </div>
  );
}
