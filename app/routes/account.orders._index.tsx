import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/account.orders._index';
import {useRef} from 'react';
import {Money, getPaginationVariables} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {Badge} from '~/components/ui/badge';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Orders'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;

  return (
    <div className="flex flex-col gap-6">
      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

function OrdersTable({
  orders,
  filters,
}: {
  orders: CustomerOrdersFragment['orders'];
  filters: OrderFilterParams;
}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div aria-live="polite">
      {orders?.nodes.length ? (
        <PaginatedResourceSection
          connection={orders}
          resourcesClassName="flex w-full flex-col gap-3"
        >
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

function EmptyOrders({hasFilters = false}: {hasFilters?: boolean}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-12 text-center">
      <p className="text-sm text-muted-foreground">
        {hasFilters
          ? 'No orders found matching your search.'
          : "You haven't placed any orders yet."}
      </p>
      <Button asChild variant="outline">
        {hasFilters ? (
          <Link to="/account/orders">Clear filters</Link>
        ) : (
          <Link to="/c/all">Start shopping</Link>
        )}
      </Button>
    </div>
  );
}

function OrderSearchForm({
  currentFilters,
}: {
  currentFilters: OrderFilterParams;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      aria-label="Search orders"
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <Input
        type="search"
        name={ORDER_FILTER_FIELDS.NAME}
        placeholder="Order #"
        aria-label="Order number"
        defaultValue={currentFilters.name || ''}
        className="sm:max-w-48"
      />
      <Input
        type="search"
        name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
        placeholder="Confirmation #"
        aria-label="Confirmation number"
        defaultValue={currentFilters.confirmationNumber || ''}
        className="sm:max-w-48"
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching' : 'Search'}
        </Button>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            disabled={isSearching}
            onClick={() => {
              setSearchParams(new URLSearchParams());
              formRef.current?.reset();
            }}
          >
            Clear
          </Button>
        )}
      </div>
    </form>
  );
}

function OrderItem({order}: {order: OrderItemFragment}) {
  const orderUrl = `/account/orders/${btoa(order.id)}`;
  return (
    <div className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link to={orderUrl} className="font-medium hover:underline">
            Order #{order.number}
          </Link>
          <Badge
            variant={
              order.fulfillmentStatus === 'FULFILLED' ? 'secondary' : 'outline'
            }
          >
            {formatStatus(order.fulfillmentStatus)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {new Date(order.processedAt).toDateString()}
          {order.confirmationNumber &&
            ` · Confirmation ${order.confirmationNumber}`}
          {order.financialStatus && ` · ${formatStatus(order.financialStatus)}`}
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <Money data={order.totalPrice} className="text-sm font-medium" />
        <Button asChild variant="outline" size="sm">
          <Link to={orderUrl}>View</Link>
        </Button>
      </div>
    </div>
  );
}

function formatStatus(status: string) {
  const text = status.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
