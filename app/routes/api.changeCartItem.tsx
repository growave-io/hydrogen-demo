import {data} from 'react-router';
import type {Route} from './+types/api.changeCartItem';
import {getOrCreateCart, toGrowaveCart} from '~/lib/growave';

export async function action({request, context}: Route.ActionArgs) {
  const {variantID, quantity, lineKey} = (await request.json()) as {
    variantID: number;
    quantity: number;
    lineKey?: string;
  };
  const cart = await getOrCreateCart(context.cart);
  const merchandiseId = `gid://shopify/ProductVariant/${variantID}`;
  const line = cart.lines.nodes.find((node) =>
    lineKey ? node.id === lineKey : node.merchandise.id === merchandiseId,
  );

  if (!line) {
    if (quantity > 0) {
      await context.cart.addLines([{merchandiseId, quantity}]);
    }
  } else if (quantity > 0) {
    await context.cart.updateLines([{id: line.id, quantity}]);
  } else {
    await context.cart.removeLines([line.id]);
  }

  return data(
    {cart: toGrowaveCart(await getOrCreateCart(context.cart)), sections: {}},
    {headers: context.cart.setCartId(cart.id)},
  );
}
