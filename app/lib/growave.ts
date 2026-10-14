import {HydrogenUtils} from '@growave-io/react-sdk';
import type {RouterContextProvider} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

export function toNumericId(gid: string) {
  return gid.split('/').pop()!.split('?')[0];
}

export async function getOrCreateCart(cart: RouterContextProvider['cart']) {
  let current = await cart.get();
  if (!current) {
    await cart.create({lines: []});
    current = await cart.get();
  }
  if (!current) throw new Error('Failed to create cart');
  return current;
}

export function toGrowaveCart(cart: CartApiQueryFragment) {
  // HydrogenUtils.convertCart reads cart.lines.edges, the skeleton's cart query returns nodes.
  const {token, items} = HydrogenUtils.convertCart({
    ...cart,
    lines: {edges: cart.lines.nodes.map((node) => ({node}))},
  });

  return {
    token,
    items: items.map((item: Record<string, unknown>, index: number) => ({
      ...item,
      key: cart.lines.nodes[index].id,
    })),
    discount_codes: cart.discountCodes.map(({code, applicable}) => ({
      code,
      applicable,
    })),
  };
}
