import {data} from 'react-router';
import type {Route} from './+types/api.applyDiscount';
import {getOrCreateCart, toGrowaveCart} from '~/lib/growave';

export async function action({request, context}: Route.ActionArgs) {
  const {discountCode} = (await request.json()) as {discountCode: string};
  const cart = await getOrCreateCart(context.cart);

  await context.cart.updateDiscountCodes([discountCode]);

  return data(
    {cart: toGrowaveCart(await getOrCreateCart(context.cart))},
    {headers: context.cart.setCartId(cart.id)},
  );
}
