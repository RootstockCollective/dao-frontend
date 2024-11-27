import { CycleContextProvider } from '@/app/collective-rewards/metrics'
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
import { PricesContextProvider } from '@/shared/context/PricesContext'
import { FC } from 'react'
import { Address } from 'viem'

type RewardsProps = RewardDetails & { gauge: Address }

const RewardsContent: FC<RewardsProps> = props => {
  const {
    gauge,
    tokens: { rif, rbtc },
  } = props
  const { isClaimable, claimRewards } = useClaimBuilderRewards(gauge, {
    rif: rif.address,
    rbtc: rbtc.address,
  })

  return (
    <div className="flex justify-center gap-4 w-full">
      <MetricContainer className="flex-1 flex flex-col items-start gap-2">
        <div className="min-h-[190px] w-full">
          <BuilderClaimableRewards {...props} />
        </div>
        <Button className="w-full" onClick={() => claimRewards()} disabled={!isClaimable} variant="primary">
          Claim all
        </Button>
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

export const Rewards: FC<RewardsProps> = ({ builder, ...rest }) => {
  return (
    <CycleContextProvider>
      <PricesContextProvider>
        <RewardsContent builder={builder} {...rest} />
      </PricesContextProvider>
    </CycleContextProvider>
  )
}
