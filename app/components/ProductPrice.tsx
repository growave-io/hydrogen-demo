import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  return (
    <div aria-label="Price" className="flex items-baseline gap-2" role="group">
      {price ? <Money data={price} /> : <span>&nbsp;</span>}
      {compareAtPrice ? (
        <s className="text-muted-foreground">
          <Money data={compareAtPrice} />
        </s>
      ) : null}
    </div>
  );
}
