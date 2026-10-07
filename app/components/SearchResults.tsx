import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';
import {PRODUCT_GRID_CLASS} from '~/components/ProductItem';
import {Button} from '~/components/ui/button';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <Pagination connection={products}>
      {({nodes, isLoading, NextLink, PreviousLink}) => (
        <div className="flex flex-col items-center gap-8">
          <Button asChild variant="outline">
            <PreviousLink>
              {isLoading ? 'Loading…' : 'Load previous'}
            </PreviousLink>
          </Button>
          <div className={PRODUCT_GRID_CLASS}>
            {nodes.map((product) => {
              const productUrl = urlWithTrackingParams({
                baseUrl: `/products/${product.handle}`,
                trackingParams: product.trackingParameters,
                term,
              });
              const price = product?.selectedOrFirstAvailableVariant?.price;
              const image = product?.selectedOrFirstAvailableVariant?.image;

              return (
                <Link
                  className="group flex flex-col gap-3"
                  key={product.id}
                  prefetch="intent"
                  to={productUrl}
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                    {image && (
                      <Image
                        data={image}
                        alt={product.title}
                        aspectRatio="1/1"
                        sizes="(min-width: 45em) 400px, 100vw"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-medium">{product.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {price && <Money data={price} />}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          <Button asChild variant="outline">
            <NextLink>{isLoading ? 'Loading…' : 'Load more'}</NextLink>
          </Button>
        </div>
      )}
    </Pagination>
  );
}

function SearchResultsEmpty() {
  return (
    <p className="text-muted-foreground">No results, try a different search.</p>
  );
}
