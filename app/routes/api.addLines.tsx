import {data} from 'react-router';
import type {Route} from './+types/api.addLines';
import {getOrCreateCart, toGrowaveCart} from '~/lib/growave';

export async function action({request, context}: Route.ActionArgs) {
  const {items} = (await request.json()) as {
    items: {variantID: string | number; quantity: number}[];
  };
  const cart = await getOrCreateCart(context.cart);

  await context.cart.addLines(
    items.map((item) => ({
      merchandiseId: `gid://shopify/ProductVariant/${item.variantID}`,
      quantity: item.quantity,
    })),
  );

  return data(
    {cart: toGrowaveCart(await getOrCreateCart(context.cart))},
    {headers: context.cart.setCartId(cart.id)},
  );
}
