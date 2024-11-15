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
import { Popover } from '@/components/Popover'
import { Button } from '@/components/Button'
import { Paragraph } from '@/components/Typography'
import { MetricContainer } from '@/app/collective-rewards/rewards/components/MetricContainer'

type RewardsProps = RewardDetails

export const Rewards: FC<RewardsProps> = ({ builder, gauges, tokens }) => {
  const { claimRewards } = useClaimBackerRewards(gauges)

  return (
    <div className="flex gap-4 w-full">
      <BackerRewardsContextProvider backer={builder} gauges={gauges} tokens={tokens}>
        <CycleContextProvider>
          <PricesContextProvider>
            <MetricContainer className="flex-1 flex flex-col gap-2">
              <div className="min-h-[190px] w-full">
                <BackerClaimableRewards builder={builder} gauges={gauges} tokens={tokens} />
              </div>
              <Popover
                content={
                  <Paragraph variant="normal" className="text-sm">
                    Wait a moment, please. Preparing the claim functionality.
                  </Paragraph>
                }
                trigger="hover"
                background="dark"
                size="small"
                position="bottom"
                className="z-[100]"
                disabled={true}
              >
                <Button className="w-full" onClick={() => claimRewards()} variant="primary">
                  Claim all
                </Button>
              </Popover>
            </MetricContainer>
            <MetricContainer>
              <BackerRewardsCard
                title="Estimated rewards"
                data-testid="EstimatedRewards"
                builder={builder}
                gauges={gauges}
                tokens={tokens}
                rewards={['estimated']}
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
