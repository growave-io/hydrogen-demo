import {placeholderDocsUrl, type Integration} from './types';

export const cartRewards: Integration = {
  title: 'Points and rewards in the cart',
  kind: 'Drop-in widget',
  description:
    'Points the order will earn and rewards the shopper can apply. The cart total is passed in cents and the widget updates when it changes. Applying a reward goes through the custom cart and discount routes registered in GrowaveSetup.',
  code: `import {
  RewardsAvailableRewardsCartWidget,
  RewardsEarnPointsCartWidget,
  WishlistsSaveForLaterModalWidget,
} from '@growave-io/react-sdk';

<RewardsEarnPointsCartWidget
  cartTotalPriceInCents={Math.round(
    Number(cart.cost.subtotalAmount.amount) * 100,
  )}
/>
<RewardsAvailableRewardsCartWidget />
<WishlistsSaveForLaterModalWidget />`,
  file: 'app/components/CartSummary.tsx',
  docsUrl: placeholderDocsUrl('rewards/rewards_earn_points_cart_widget'),
};
