import type {Route} from './+types/pages.wishlist';
import {WishlistsPageWidget} from '@growave-io/react-sdk';
import {IntegrationSection} from '~/components/growave/IntegrationSection';
import {wishlistPage} from '~/integrations/pages';
import {WidgetPage} from '~/components/growave/WidgetPage';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Wishlists Page'}];
};

export default function Page() {
  return (
    <WidgetPage title="Wishlists Page">
      <IntegrationSection integration={wishlistPage}>
        <WishlistsPageWidget />
      </IntegrationSection>
    </WidgetPage>
  );
}
