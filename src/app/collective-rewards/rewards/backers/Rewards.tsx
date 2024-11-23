import { FC } from 'react'
import {
  BackerAllTimeShare,
  BackerClaimableRewards,
  useClaimBackerRewards,
} from '@/app/collective-rewards/rewards/backers'
import {
  RewardDetails,
  BackerRewardsCard,
  BackerRewardsContextProvider,
} from '@/app/collective-rewards/rewards'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { PricesContextProvider } from '@/shared/context/PricesContext'
import { Button } from '@/components/Button'
import { MetricContainer } from '@/app/collective-rewards/rewards/components/MetricContainer'

type RewardsProps = RewardDetails

export const Rewards: FC<RewardsProps> = ({ builder, gauges, tokens }) => {
  const { claimRewards, isClaimFunctionReady } = useClaimBackerRewards(gauges)

  return (
    <div className="flex gap-4 w-full">
      <BackerRewardsContextProvider backer={builder} gauges={gauges} tokens={tokens}>
        <CycleContextProvider>
          <PricesContextProvider>
            <MetricContainer className="flex-1 flex flex-col gap-2">
              <div className="min-h-[190px] w-full">
                <BackerClaimableRewards builder={builder} gauges={gauges} tokens={tokens} />
              </div>
              <Button
                className="w-full"
                onClick={() => claimRewards()}
                disabled={!isClaimFunctionReady}
                variant="primary"
              >
                Claim all
              </Button>
            </MetricContainer>
            <MetricContainer>
              <BackerRewardsCard
                title="Estimated rewards"
                data-testid="EstimatedRewards"
                builder={builder}
                gauges={gauges}
                tokens={tokens}
                rewards={['estimated']}
                tooltip={{
                  text: 'The information displayed is dynamic and may vary based on total rewards available and user activity. This data is provided for informational purposes only. Please note that the final reward amount will be determined at the end of the cycle.',
                  popoverProps: { size: 'medium' },
                }}
              />
            </MetricContainer>
            <MetricContainer>
              <BackerRewardsCard
                title="All time rewards"
                data-testid="AllTimeRewards"
                builder={builder}
                gauges={gauges}
                tokens={tokens}
                rewards={['earned', 'claimed']}
                tooltip={{
                  text: 'Total sum of your rewards: received and claimable',
                  popoverProps: { size: 'medium' },
                }}
              />
            </MetricContainer>
            <MetricContainer>
              <BackerAllTimeShare gauges={gauges} tokens={tokens} />
            </MetricContainer>
          </PricesContextProvider>
        </CycleContextProvider>
      </BackerRewardsContextProvider>
    </div>
  )
}
