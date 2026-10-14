import type {RouterContextProvider} from 'react-router';
import {CURRENT_CUSTOMER_QUERY} from '~/graphql/customer-account/CurrentCustomerQuery';

export type CurrentCustomer = {
  id: string;
  firstName: string | null;
  email: string | null;
  initials: string;
};

export function getInitials({
  firstName,
  lastName,
  email,
}: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}) {
  return (
    [firstName, lastName]
      .map((name) => name?.trim().charAt(0))
      .join('')
      .toUpperCase() ||
    email?.charAt(0).toUpperCase() ||
    '?'
  );
}

export async function getCurrentCustomer(
  customerAccount: RouterContextProvider['customerAccount'],
): Promise<CurrentCustomer | null> {
  if (!(await customerAccount.isLoggedIn())) return null;

  const {data} = await customerAccount.query(CURRENT_CUSTOMER_QUERY);
  const customer = data?.customer;
  if (!customer) return null;

  const email = customer.emailAddress?.emailAddress ?? null;
  return {
    id: customer.id,
    firstName: customer.firstName ?? null,
    email,
    initials: getInitials({...customer, email}),
  };
}
