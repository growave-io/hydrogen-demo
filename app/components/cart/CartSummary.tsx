import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/cart/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useId} from 'react';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Separator} from '~/components/ui/separator';
import {cn} from '~/lib/utils';
import {IntegrationSection} from '~/components/growave/IntegrationSection';
import {cartRewards} from '~/integrations/cart';
import {
  RewardsAvailableRewardsCartWidget,
  RewardsEarnPointsCartWidget,
  WishlistsSaveForLaterModalWidget,
} from '@growave-io/react-sdk';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const summaryId = useId();
  const discountCodeInputId = useId();

  return (
    <div
      aria-labelledby={summaryId}
      className={cn(
        'flex flex-col gap-4',
        layout === 'page' && 'h-fit rounded-xl border p-6',
      )}
    >
      <h2 id={summaryId} className="font-heading font-semibold">
        Summary
      </h2>
      <CartDiscounts
        discountCodes={cart?.discountCodes}
        discountCodeInputId={discountCodeInputId}
      />
      <Separator />
      <dl role="group" className="flex justify-between text-sm">
        <dt>Subtotal</dt>
        <dd className="font-medium">
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart?.cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </dd>
      </dl>
      <IntegrationSection
        integration={cartRewards}
        variant={layout === 'aside' ? 'badge' : 'rail'}
        className="flex flex-col gap-4"
      >
        <RewardsEarnPointsCartWidget
          cartTotalPriceInCents={Math.round(
            Number(cart?.cost?.subtotalAmount?.amount ?? 0) * 100,
          )}
        />
        <RewardsAvailableRewardsCartWidget />
        <WishlistsSaveForLaterModalWidget />
      </IntegrationSection>
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;

  return (
    <Button asChild size="lg" className="w-full">
      <a href={checkoutUrl} target="_self">
        Checkout
      </a>
    </Button>
  );
}

function CartDiscounts({
  discountCodes,
  discountCodeInputId,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  discountCodeInputId: string;
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <section aria-label="Discounts" className="flex flex-col gap-2">
      {codes.length > 0 && (
        <UpdateDiscountForm>
          <div className="flex items-center justify-between text-sm">
            <span>
              Discount: <code>{codes.join(', ')}</code>
            </span>
            <Button
              type="submit"
              variant="link"
              size="sm"
              aria-label="Remove discount"
            >
              Remove
            </Button>
          </div>
        </UpdateDiscountForm>
      )}

      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex gap-2">
          <label htmlFor={discountCodeInputId} className="sr-only">
            Discount code
          </label>
          <Input
            id={discountCodeInputId}
            type="text"
            name="discountCode"
            placeholder="Discount code"
          />
          <Button
            type="submit"
            variant="outline"
            aria-label="Apply discount code"
          >
            Apply
          </Button>
        </div>
      </UpdateDiscountForm>
    </section>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}
