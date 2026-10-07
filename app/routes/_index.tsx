import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {ProductItem, PRODUCT_GRID_CLASS} from '~/components/ProductItem';
import {Button} from '~/components/ui/button';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Hydrogen Demo'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {recommendedProducts};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-start gap-6 py-12 sm:py-20">
        <h1 className="max-w-2xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Simple things, made well.
        </h1>
        <p className="max-w-xl text-muted-foreground">
          A minimal Hydrogen storefront.
        </p>
        <Button asChild size="lg">
          <Link to="/collections/all" prefetch="intent">
            Shop all
          </Link>
        </Button>
      </section>
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
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

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
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
