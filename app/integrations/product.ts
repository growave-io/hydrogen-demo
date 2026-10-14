import {placeholderDocsUrl, type Integration} from './types';

export const productStarRating: Integration = {
  title: 'Star rating',
  kind: 'Drop-in widget',
  description:
    'Average rating and review count under the product title. Clicking it scrolls to the reviews.',
  code: `import {ReviewsStarRatingWidget} from '@growave-io/react-sdk';

<ReviewsStarRatingWidget productId={productId} />`,
  file: 'app/routes/p.$handle.tsx',
  docsUrl: placeholderDocsUrl('reviews/reviews_star_rating_widget'),
};

export const productActions: Integration = {
  title: 'Wishlist, gift registry and points',
  kind: 'Drop-in widget',
  description:
    'Add to wishlist, add to registry and the points a shopper earns for this product. All three read the selected variant from data-gw-variant-id, so they follow variant changes without remounting.',
  code: `import {
  GiftRegistryAddToRegistryProductPageWidget,
  RewardsEarnPointsProductPageWidget,
  WishlistsAddToWishlistProductPageWidget,
} from '@growave-io/react-sdk';

<WishlistsAddToWishlistProductPageWidget
  productId={productId}
  variantId={variantId}
/>
<GiftRegistryAddToRegistryProductPageWidget
  productId={productId}
  variantId={variantId}
/>
<RewardsEarnPointsProductPageWidget
  productId={productId}
  variantId={variantId}
/>`,
  file: 'app/routes/p.$handle.tsx',
  docsUrl: placeholderDocsUrl('wishlists/add_to_wishlist_product_page_widget'),
};

export const productMiniSlider: Integration = {
  title: 'Reviews mini slider',
  kind: 'Drop-in widget',
  description: 'A compact carousel of reviews for this product.',
  code: `import {ReviewsMiniSliderWidget} from '@growave-io/react-sdk';

<ReviewsMiniSliderWidget productId={productId} />`,
  file: 'app/routes/p.$handle.tsx',
  docsUrl: placeholderDocsUrl('reviews/product_reviews_mini_slider_widget'),
};

export const productInstagramGallery: Integration = {
  title: 'Instagram gallery for the product',
  kind: 'Drop-in widget',
  description:
    'The same gallery as on the home page, filtered to posts tagged with this product.',
  code: `import {InstagramGalleryWidget} from '@growave-io/react-sdk';

<InstagramGalleryWidget
  galleryId={galleryId}
  galleryLayout={2}
  productId={productId}
/>`,
  file: 'app/routes/p.$handle.tsx',
  docsUrl: placeholderDocsUrl('instagram/instagram_gallery_widget'),
};

export const productReviews: Integration = {
  title: 'Product reviews',
  kind: 'Drop-in widget',
  description:
    'The full reviews block: rating summary, photos, filters, the review list and the write a review form.',
  code: `import {ReviewsProductPageWidget} from '@growave-io/react-sdk';

<ReviewsProductPageWidget productId={productId} />`,
  file: 'app/routes/p.$handle.tsx',
  docsUrl: placeholderDocsUrl('reviews/reviews_product_page_widget'),
};
