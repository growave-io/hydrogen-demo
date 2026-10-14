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
import {getInitials} from '~/lib/customer';
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
  const email = customer.emailAddress?.emailAddress;
  const initials = getInitials({...customer, email});

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium"
          >
            {initials}
          </div>
          <div className="flex min-w-0 flex-col">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {customer.firstName ? `Hi, ${customer.firstName}` : 'Hi there'}
            </h1>
            {email && (
              <p className="truncate text-sm text-muted-foreground">{email}</p>
            )}
          </div>
        </div>
        <AccountMenu />
      </div>
      <Outlet context={{customer}} />
    </div>
  );
}

function AccountMenu() {
  const linkClassName = ({isActive}: {isActive: boolean}) =>
    cn(
      '-mb-px border-b-2 border-transparent px-3 pb-3 pt-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
      isActive && 'border-foreground text-foreground',
    );

  return (
    <nav role="navigation" className="flex items-end gap-1 border-b">
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
    <Form className="ml-auto pb-2" method="POST" action="/account/logout">
      <Button type="submit" variant="ghost" size="sm">
        Sign out
      </Button>
    </Form>
  );
}
