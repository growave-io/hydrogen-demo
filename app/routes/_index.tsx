import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {ArrowRightIcon} from 'lucide-react';
import type {
  HeroCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {
  ProductItem,
  PRODUCT_GRID_CLASS,
} from '~/components/product/ProductItem';
import {
  InstagramGalleryWidget,
  ReviewsSliderWidget,
} from '@growave-io/react-sdk';
import {useGrowaveConfig} from '~/components/growave/GrowaveWidgets';
import {IntegrationSection} from '~/components/growave/IntegrationSection';
import {
  homeInstagramGallery,
  productCardWidgets,
  reviewsSlider,
} from '~/integrations/home';
import {Badge} from '~/components/ui/badge';
import {Button} from '~/components/ui/button';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Growave Hydrogen Demo'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const {collections} = await context.storefront.query(HERO_COLLECTION_QUERY);
  const heroCollection = collections.nodes.find(
    (collection) => collection.image,
  );

  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {heroCollection, recommendedProducts};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const growave = useGrowaveConfig();
  return (
    <div className="flex flex-col gap-16">
      <Hero collection={data.heroCollection} />
      <IntegrationSection integration={productCardWidgets}>
        <RecommendedProducts products={data.recommendedProducts} />
      </IntegrationSection>
      <IntegrationSection integration={reviewsSlider}>
        <ReviewsSliderWidget />
      </IntegrationSection>
      {growave?.instagramGalleryId && (
        <IntegrationSection integration={homeInstagramGallery}>
          <InstagramGalleryWidget
            galleryId={growave.instagramGalleryId}
            galleryLayout={3}
          />
        </IntegrationSection>
      )}
    </div>
  );
}

function Hero({collection}: {collection?: HeroCollectionFragment}) {
  return (
    <section className="grid items-center gap-8 overflow-hidden rounded-3xl bg-muted p-6 sm:p-10 md:grid-cols-2 md:gap-12 lg:p-14">
      <div className="flex flex-col items-start gap-6">
        <Badge variant="secondary" className="bg-background">
          New season
        </Badge>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Everyday essentials, thoughtfully made.
        </h1>
        <p className="max-w-md text-lg text-pretty text-muted-foreground">
          Simple pieces in quality materials, designed to be worn every day.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/c/all" prefetch="intent">
              Shop all
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-background">
            <Link to="/collections" prefetch="intent">
              Browse collections
            </Link>
          </Button>
        </div>
      </div>
      {collection?.image && (
        <Link
          to={`/c/${collection.handle}`}
          prefetch="intent"
          className="group relative block aspect-square overflow-hidden rounded-2xl bg-background shadow-sm"
        >
          <Image
            data={collection.image}
            alt={collection.image.altText || collection.title}
            aspectRatio="1/1"
            loading="eager"
            sizes="(min-width: 48em) 50vw, 100vw"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-sm font-medium shadow-sm backdrop-blur">
            <span className="text-muted-foreground">Featured</span>
            {collection.title}
            <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}
    </section>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section
      className="flex flex-col gap-6"
      aria-labelledby="recommended-products"
    >
      <h2
        id="recommended-products"
        className="font-heading text-xl font-semibold tracking-tight"
      >
        New arrivals
      </h2>
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <Await resolve={products}>
          {(response) => (
            <div className={PRODUCT_GRID_CLASS}>
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
    </section>
  );
}

const HERO_COLLECTION_QUERY = `#graphql
  fragment HeroCollection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query HeroCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 10, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HeroCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
    }
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
