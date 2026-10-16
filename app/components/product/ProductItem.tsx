import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {
  ReviewsProductCardAverageRatingWidget,
  WishlistsAddToWishlistProductCardWidget,
} from '@growave-io/react-sdk';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {toNumericId} from '~/lib/growave';
import {useVariantUrl} from '~/lib/variants';

export function ProductItem({
  product,
  loading,
}: {
  product:
    CollectionItemFragment | ProductItemFragment | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const productId = toNumericId(product.id);
  const variant = product.selectedOrFirstAvailableVariant;

  return (
    <div className="group relative isolate flex flex-col gap-3">
      <Link
        className="flex flex-col gap-3"
        key={product.id}
        prefetch="intent"
        to={variantUrl}
      >
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          {image && (
            <Image
              alt={image.altText || product.title}
              aspectRatio="1/1"
              data={image}
              loading={loading}
              sizes="(min-width: 45em) 400px, 100vw"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">{product.title}</h3>
          <ReviewsProductCardAverageRatingWidget productId={productId} />
          <span className="text-sm text-muted-foreground">
            <Money data={product.priceRange.minVariantPrice} />
          </span>
        </div>
      </Link>
      {variant && (
        <div className="absolute inset-x-0 top-0 aspect-square">
          <WishlistsAddToWishlistProductCardWidget
            productId={productId}
            variantId={toNumericId(variant.id)}
            widgetOffsetTop={14}
            widgetOffsetSide={14}
            wishlistCounterPosition="left"
          />
        </div>
      )}
    </div>
  );
}

export const PRODUCT_GRID_CLASS =
  'grid w-full grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4';
