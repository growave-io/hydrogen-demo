import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {Button} from '~/components/ui/button';
import {cn} from '~/lib/utils';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {heading}
      </h1>
      <AccountMenu />
      <div className="account-content">
        <Outlet context={{customer}} />
      </div>
    </div>
  );
}

function AccountMenu() {
  const linkClassName = ({isActive}: {isActive: boolean}) =>
    cn(
      'rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
      isActive && 'bg-muted text-foreground',
    );

  return (
    <nav
      role="navigation"
      className="flex flex-wrap items-center gap-1 border-b pb-4"
    >
      <NavLink to="/account/orders" className={linkClassName}>
        Orders
      </NavLink>
      <NavLink to="/account/profile" className={linkClassName}>
        Profile
      </NavLink>
      <NavLink to="/account/addresses" className={linkClassName}>
        Addresses
      </NavLink>
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form className="ml-auto" method="POST" action="/account/logout">
      <Button type="submit" variant="ghost" size="sm">
        Sign out
      </Button>
    </Form>
  );
}
