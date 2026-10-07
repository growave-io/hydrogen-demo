import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import {Button} from '~/components/ui/button';

/**
 * <PaginatedResourceSection> encapsulates the previous and next pagination behaviors throughout your application.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: (props: {node: NodesType; index: number}) => React.ReactNode;
  ariaLabel?: string;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div className="flex flex-col items-center gap-8">
            <Button asChild variant="outline">
              <PreviousLink>
                {isLoading ? 'Loading…' : 'Load previous'}
              </PreviousLink>
            </Button>
            <div
              aria-label={ariaLabel}
              className={resourcesClassName ?? 'w-full'}
              role={ariaLabel ? 'region' : undefined}
            >
              {resourcesMarkup}
            </div>
            <Button asChild variant="outline">
              <NextLink>{isLoading ? 'Loading…' : 'Load more'}</NextLink>
            </Button>
          </div>
        );
      }}
    </Pagination>
  );
}
