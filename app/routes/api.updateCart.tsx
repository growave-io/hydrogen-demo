import {data} from 'react-router';
import type {Route} from './+types/api.updateCart';
import {getOrCreateCart, toGrowaveCart} from '~/lib/growave';

// Mirrors Shopify's /cart/update.js: `discount` is a comma-separated list that
// replaces the cart's discount codes, an empty string clears them.
export async function action({request, context}: Route.ActionArgs) {
  const {discount, attributes} = (await request.json()) as {
    discount?: string;
    attributes?: Record<string, string>;
  };
  const cart = await getOrCreateCart(context.cart);

  if (discount !== undefined) {
    await context.cart.updateDiscountCodes(
      discount
        .split(',')
        .map((code) => code.trim())
        .filter(Boolean),
    );
  }
  if (attributes) {
    await context.cart.updateAttributes(
      Object.entries(attributes).map(([key, value]) => ({key, value})),
    );
  }

  return data(
    {...toGrowaveCart(await getOrCreateCart(context.cart)), sections: {}},
    {headers: context.cart.setCartId(cart.id)},
  );
}
