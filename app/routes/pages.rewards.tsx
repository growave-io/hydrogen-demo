import type {Route} from './+types/pages.rewards';
import {
  RewardsAvailableRewardsPageWidget,
  RewardsHistoryPageWidget,
  RewardsReferralProgramPageWidget,
  RewardsVipTiersPageWidget,
  RewardsWaysToEarnPageWidget,
  RewardsWaysToSpendPageWidget,
} from '@growave-io/react-sdk';
import {IntegrationSection} from '~/components/growave/IntegrationSection';
import {
  rewardsAvailableRewards,
  rewardsHistory,
  rewardsReferralProgram,
  rewardsVipTiers,
  rewardsWaysToEarn,
  rewardsWaysToSpend,
} from '~/integrations/pages';
import {WidgetPage} from '~/components/growave/WidgetPage';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Rewards Page'}];
};

export default function Page() {
  return (
    <WidgetPage title="Rewards Page">
      <IntegrationSection integration={rewardsAvailableRewards}>
        <RewardsAvailableRewardsPageWidget />
      </IntegrationSection>
      <IntegrationSection integration={rewardsWaysToEarn}>
        <RewardsWaysToEarnPageWidget />
      </IntegrationSection>
      <IntegrationSection integration={rewardsWaysToSpend}>
        <RewardsWaysToSpendPageWidget />
      </IntegrationSection>
      <IntegrationSection integration={rewardsVipTiers}>
        <RewardsVipTiersPageWidget />
      </IntegrationSection>
      <IntegrationSection integration={rewardsReferralProgram}>
        <RewardsReferralProgramPageWidget />
      </IntegrationSection>
      <IntegrationSection integration={rewardsHistory}>
        <RewardsHistoryPageWidget />
      </IntegrationSection>
    </WidgetPage>
  );
}
