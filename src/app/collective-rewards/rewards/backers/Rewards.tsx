import { FC } from 'react'
import {
  BackerAllTimeShare,
  BackerClaimableRewards,
  useClaimBackerRewards,
} from '@/app/collective-rewards/rewards/backers'
import {
  RewardDetails,
  useClaimStateReporting,
  BackerRewardsCard,
  BackerRewardsContextProvider,
} from '@/app/collective-rewards/rewards'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { PricesContextProvider } from '@/shared/context/PricesContext'
import { Popover } from '@/components/Popover'
import { Button } from '@/components/Button'
import { Paragraph } from '@/components/Typography'

type RewardsProps = RewardDetails

export const Rewards: FC<RewardsProps> = ({ builder, gauges, tokens }) => {
  const { claimRewards, ...claimTx } = useClaimBackerRewards(gauges)

  useClaimStateReporting({ ...claimTx })

  return (
    <div className="grid grid-cols-4 gap-[16px]">
      <BackerRewardsContextProvider backer={builder} gauges={gauges} tokens={tokens}>
        <CycleContextProvider>
          <PricesContextProvider>
            <BackerClaimableRewards builder={builder} gauges={gauges} tokens={tokens} />
            <BackerRewardsCard
              title="Estimated rewards"
              data-testid="EstimatedRewards"
              builder={builder}
              gauges={gauges}
              tokens={tokens}
              rewards={['estimated']}
            />
            <BackerRewardsCard
              title="All time rewards"
              data-testid="AllTimeRewards"
              builder={builder}
              gauges={gauges}
              tokens={tokens}
              rewards={['earned', 'claimed']}
            />
            <BackerAllTimeShare gauges={gauges} tokens={tokens} />
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
          </PricesContextProvider>
        </CycleContextProvider>
      </BackerRewardsContextProvider>
    </div>
  )
}
