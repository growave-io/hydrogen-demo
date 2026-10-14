import {placeholderDocsUrl, type Integration} from './types';

function pageWidget(
  title: string,
  description: string,
  component: string,
  docsPath: string,
  file: string,
): Integration {
  return {
    title,
    kind: 'Drop-in widget',
    description,
    code: `import {${component}} from '@growave-io/react-sdk';\n\n<${component} />`,
    file,
    docsUrl: placeholderDocsUrl(docsPath),
  };
}

const REWARDS_FILE = 'app/routes/pages.rewards.tsx';

export const rewardsAvailableRewards = pageWidget(
  'Available rewards',
  'Rewards the logged-in customer can redeem right now. Hidden for guests.',
  'RewardsAvailableRewardsPageWidget',
  'rewards/rewards_available_rewards_page_widget',
  REWARDS_FILE,
);
export const rewardsWaysToEarn = pageWidget(
  'Ways to earn',
  'Every action that earns points, as configured in Growave admin.',
  'RewardsWaysToEarnPageWidget',
  'rewards/rewards_ways_to_earn_page_widget',
  REWARDS_FILE,
);
export const rewardsWaysToSpend = pageWidget(
  'Ways to spend',
  'Rewards points can be exchanged for.',
  'RewardsWaysToSpendPageWidget',
  'rewards/rewards_ways_to_spend_page_widget',
  REWARDS_FILE,
);
export const rewardsVipTiers = pageWidget(
  'VIP tiers',
  'The loyalty tiers and what each one unlocks.',
  'RewardsVipTiersPageWidget',
  'rewards/rewards_vip_tiers_page_widget',
  REWARDS_FILE,
);
export const rewardsReferralProgram = pageWidget(
  'Referral program',
  'Referral rewards for the customer and the friend they invite.',
  'RewardsReferralProgramPageWidget',
  'rewards/rewards_referral_program_page_widget',
  REWARDS_FILE,
);
export const rewardsHistory = pageWidget(
  'Points history',
  "The logged-in customer's points activity. Hidden for guests.",
  'RewardsHistoryPageWidget',
  'rewards/rewards_history_page_widget',
  REWARDS_FILE,
);
export const wishlistPage = pageWidget(
  'Wishlist page',
  'All wishlists of the shopper. Growave links here from the header icon and the wishlist drawer, so the route has to be /pages/wishlist.',
  'WishlistsPageWidget',
  'wishlists/wishlist_page_widget',
  'app/routes/pages.wishlist.tsx',
);
export const reviewsPage = pageWidget(
  'Reviews page',
  'All store reviews with summary, photos and filters. The reviews drawer launcher is hidden on /pages/reviews. The widget stretches to the full window width by default; GrowaveWidgetStyles keeps it inside the page with a gw-style-for-ReviewsPageWidgetV2 style tag.',
  'ReviewsPageWidget',
  'reviews/reviews_page_widget',
  'app/routes/pages.reviews.tsx',
);
