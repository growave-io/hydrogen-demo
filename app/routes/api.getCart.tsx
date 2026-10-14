import {data} from 'react-router';
import type {Route} from './+types/api.getCart';
import {getOrCreateCart, toGrowaveCart} from '~/lib/growave';

export async function loader({context}: Route.LoaderArgs) {
  const cart = await getOrCreateCart(context.cart);

  return data(
    {cart: toGrowaveCart(cart)},
    {headers: context.cart.setCartId(cart.id)},
  );
}
