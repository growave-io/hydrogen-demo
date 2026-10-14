import type {Route} from './+types/pages.reviews';
import {ReviewsPageWidget} from '@growave-io/react-sdk';
import {IntegrationSection} from '~/components/IntegrationSection';
import {reviewsPage} from '~/integrations/pages';
import {WidgetPage} from '~/components/WidgetPage';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Reviews Page'}];
};

export default function Page() {
  return (
    <WidgetPage title="Reviews Page">
      <IntegrationSection integration={reviewsPage}>
        <ReviewsPageWidget />
      </IntegrationSection>
    </WidgetPage>
  );
}
