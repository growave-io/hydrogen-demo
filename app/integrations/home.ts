import {placeholderDocsUrl, type Integration} from './types';

export const productCardWidgets: Integration = {
  title: 'Rating and wishlist on product cards',
  kind: 'Drop-in widget',
  description:
    'Every product card shows its average rating and an add to wishlist button with a counter. Both are placeholders rendered inside the card; Growave fills them in after the SDK initializes.',
  code: `import {
  ReviewsProductCardAverageRatingWidget,
  WishlistsAddToWishlistProductCardWidget,
} from '@growave-io/react-sdk';

<ReviewsProductCardAverageRatingWidget productId={productId} />

// Pinned to the top right corner of the card image.
<div className="absolute inset-x-0 top-0 aspect-square">
  <WishlistsAddToWishlistProductCardWidget
    productId={productId}
    variantId={variantId}
    widgetOffsetTop={14}
    widgetOffsetSide={14}
    wishlistCounterPosition="left"
  />
</div>`,
  file: 'app/components/ProductItem.tsx',
  docsUrl: placeholderDocsUrl('wishlists/add_to_wishlist_product_card_widget'),
};

export const reviewsSlider: Integration = {
  title: 'Reviews slider',
  kind: 'Drop-in widget',
  description:
    "A carousel of the store's best reviews. The widget takes no props; what it shows is configured in Growave admin.",
  code: `import {ReviewsSliderWidget} from '@growave-io/react-sdk';

<ReviewsSliderWidget />`,
  file: 'app/routes/_index.tsx',
  docsUrl: placeholderDocsUrl('reviews/reviews_slider_widget'),
};

export const homeInstagramGallery: Integration = {
  title: 'Instagram gallery',
  kind: 'Drop-in widget',
  description:
    'Shoppable Instagram feed. The gallery ID comes from Growave admin and is set per store in PUBLIC_GROWAVE_INSTAGRAM_GALLERY_ID.',
  code: `import {InstagramGalleryWidget} from '@growave-io/react-sdk';

<InstagramGalleryWidget galleryId={galleryId} galleryLayout={3} />`,
  file: 'app/routes/_index.tsx',
  docsUrl: placeholderDocsUrl('instagram/instagram_gallery_widget'),
};
