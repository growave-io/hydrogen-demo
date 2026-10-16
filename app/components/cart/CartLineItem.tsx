import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/cart/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {MinusIcon, PlusIcon, XIcon} from 'lucide-react';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from '~/components/product/ProductPrice';
import {useAside} from '~/components/layout/Aside';
import {Button} from '~/components/ui/button';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. If the line is a parent line that has child
 * components (like warranties or gift wrapping), they are rendered nested below it.
 */
export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;
  const options = selectedOptions.filter(
    (option) => option.value !== 'Default Title',
  );

  return (
    <li key={id} className="py-4">
      <div className="flex gap-4">
        <div className="size-20 shrink-0 overflow-hidden rounded-md bg-muted">
          {image && (
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={80}
              loading="lazy"
              width={80}
              className="size-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 text-sm">
          <div className="flex items-start justify-between gap-2">
            <Link
              prefetch="intent"
              to={lineItemUrl}
              className="font-medium hover:underline"
              onClick={() => {
                if (layout === 'aside') {
                  close();
                }
              }}
            >
              {product.title}
            </Link>
            <ProductPrice price={line?.cost?.totalAmount} />
          </div>
          {options.length > 0 && (
            <p className="text-muted-foreground">
              {options.map((option) => option.value).join(' / ')}
            </p>
          )}
          <CartLineQuantity line={line} />
        </div>
      </div>

      {lineItemChildren ? (
        <div className="ml-24">
          <p id={childrenLabelId} className="sr-only">
            Line items with {product.title}
          </p>
          <ul aria-labelledby={childrenLabelId}>
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/**
 * Quantity controls are disabled while the line is optimistic, i.e. the server
 * hasn't yet confirmed it was added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex items-center rounded-md border">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
          >
            <MinusIcon />
          </Button>
        </CartLineUpdateButton>
        <span className="w-8 text-center tabular-nums">{quantity}</span>
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
          >
            <PlusIcon />
          </Button>
        </CartLineUpdateButton>
      </div>
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Remove"
        disabled={disabled}
        type="submit"
      >
        <XIcon />
      </Button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Actions modifying the same lines share a key, so rapid clicks cancel each
 * other and only the last one runs.
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
