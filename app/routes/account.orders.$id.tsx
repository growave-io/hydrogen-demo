import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {Badge} from '~/components/ui/badge';
import {Button} from '~/components/ui/button';
import {Separator} from '~/components/ui/separator';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'N/A';

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<
          typeof firstDiscount,
          {__typename: 'MoneyV2'}
        >)
      : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (
          firstDiscount as Extract<
            typeof firstDiscount,
            {__typename: 'PricingPercentageValue'}
          >
        ).percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();
  const hasDiscount =
    (discountValue && Number(discountValue.amount) > 0) || discountPercentage;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-lg font-semibold">
              Order {order.name}
            </h2>
            <Badge
              variant={
                order.fulfillmentStatus === 'FULFILLED'
                  ? 'secondary'
                  : 'outline'
              }
            >
              {formatStatus(order.fulfillmentStatus)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Placed on {new Date(order.processedAt!).toDateString()}
            {order.confirmationNumber &&
              ` · Confirmation ${order.confirmationNumber}`}
          </p>
        </div>
        <Button asChild variant="outline">
          <a target="_blank" href={order.statusPageUrl} rel="noreferrer">
            View order status
          </a>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <ul className="flex flex-col divide-y rounded-xl border">
          {lineItems.map((lineItem, lineItemIndex) => (
            // eslint-disable-next-line react/no-array-index-key
            <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
          ))}
        </ul>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 rounded-xl border p-6 text-sm">
            <h3 className="font-heading text-lg font-semibold">Summary</h3>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <Money data={order.subtotal!} />
            </div>
            {hasDiscount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discounts</span>
                {discountPercentage ? (
                  <span>-{discountPercentage}% OFF</span>
                ) : (
                  discountValue && <Money data={discountValue} />
                )}
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <Money data={order.totalTax!} />
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <Money data={order.totalPrice!} />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border p-6 text-sm">
            <h3 className="font-heading text-lg font-semibold">
              Shipping address
            </h3>
            {order?.shippingAddress ? (
              <address className="flex flex-col gap-1 not-italic text-muted-foreground">
                <span className="text-foreground">
                  {order.shippingAddress.name}
                </span>
                {order.shippingAddress.formatted && (
                  <span>{order.shippingAddress.formatted}</span>
                )}
                {order.shippingAddress.formattedArea && (
                  <span>{order.shippingAddress.formattedArea}</span>
                )}
              </address>
            ) : (
              <p className="text-muted-foreground">
                No shipping address defined
              </p>
            )}
            {fulfillmentStatus !== 'N/A' && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fulfillment</span>
                  <span>{formatStatus(fulfillmentStatus)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  const hasDiscount = Number(lineItem.totalDiscount?.amount) > 0;
  return (
    <li className="flex gap-4 p-4">
      <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {lineItem?.image && (
          <Image
            data={lineItem.image}
            width={64}
            height={64}
            className="size-full object-cover"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm font-medium">{lineItem.title}</p>
        {lineItem.variantTitle && (
          <p className="text-sm text-muted-foreground">
            {lineItem.variantTitle}
          </p>
        )}
        <p className="text-sm text-muted-foreground">Qty {lineItem.quantity}</p>
      </div>
      <div className="flex flex-col items-end gap-1 text-sm">
        <Money data={lineItem.price!} />
        {hasDiscount && (
          <span className="flex gap-1 text-muted-foreground">
            −<Money data={lineItem.totalDiscount} as="span" />
          </span>
        )}
      </div>
    </li>
  );
}

function formatStatus(status: string) {
  const text = status.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
