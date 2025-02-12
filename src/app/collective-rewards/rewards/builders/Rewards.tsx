import {
  BuilderAllTimeRewards,
  BuilderAllTimeShare,
  BuilderClaimableRewards,
  BuilderEstimatedRewards,
  BuilderLastCycleRewards,
  RewardDetails,
  useClaimBuilderRewards,
} from '@/app/collective-rewards/rewards'
import { MetricContainer } from '@/app/collective-rewards/rewards/components/MetricContainer'
import { Button } from '@/components/Button'
import { FC } from 'react'
import { Address } from 'viem'
import { Popover } from '@/components/Popover'

type RewardsProps = RewardDetails & { gauge: Address }

export const Rewards: FC<RewardsProps> = props => {
  const {
    builder,
    gauge,
    tokens: { rif, rbtc },
  } = props
  const { isClaimable, claimRewards, isPaused } = useClaimBuilderRewards(builder, gauge, {
    rif: rif.address,
    rbtc: rbtc.address,
  })

  return (
    <div className="flex justify-center gap-4 w-full">
      <MetricContainer className="flex-1 flex flex-col items-start gap-2">
        <div className="min-h-[190px] w-full">
          <BuilderClaimableRewards {...props} />
        </div>
        <Popover
          content={
            <div className="text-[12px] font-bold mb-1">
              <p data-testid="adjustBackerRewardPctTooltip">You cannot be paused to claim rewards</p>
            </div>
          }
          className="w-full"
          size="small"
          position="top"
          trigger="hover"
          disabled={!isPaused}
        >
          <Button
            className="w-full"
            onClick={() => claimRewards()}
            disabled={!isClaimable || isPaused}
            variant="primary"
          >
            Claim all
          </Button>
        </Popover>
      </MetricContainer>
      <MetricContainer>
        <BuilderLastCycleRewards {...props} />
      </MetricContainer>
      <MetricContainer>
        <BuilderEstimatedRewards {...props} />
      </MetricContainer>
      <MetricContainer>
        <BuilderAllTimeRewards {...props} />
      </MetricContainer>
      <MetricContainer>
        <BuilderAllTimeShare {...props} />
      </MetricContainer>
    </div>
  )
}
