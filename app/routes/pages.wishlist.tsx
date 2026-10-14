import type {Route} from './+types/pages.wishlist';
import {WishlistsPageWidget} from '@growave-io/react-sdk';
import {IntegrationSection} from '~/components/IntegrationSection';
import {wishlistPage} from '~/integrations/pages';
import {WidgetPage} from '~/components/WidgetPage';

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
