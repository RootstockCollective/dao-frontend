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
import { Popover } from '@/components/Popover'
import { Paragraph } from '@/components/Typography'
import { PricesContextProvider } from '@/shared/context/PricesContext'
import { FC } from 'react'
import { Address } from 'viem'

type RewardsProps = RewardDetails & { gauge: Address }

export const Rewards: FC<RewardsProps> = ({ builder, ...rest }) => {
  const { isClaimFunctionReady, claimRewards } = useClaimBuilderRewards(builder)

  return (
    <CycleContextProvider>
      <PricesContextProvider>
        <div className="flex justify-center gap-4 w-full">
          <MetricContainer className="flex-1 flex flex-col items-start gap-2">
            <div className="min-h-[190px] w-full">
              <BuilderClaimableRewards builder={builder} {...rest} />
            </div>
            <Popover
              disabled={isClaimFunctionReady}
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
            >
              <Button
                className="w-full"
                onClick={() => claimRewards()}
                disabled={!isClaimFunctionReady}
                variant="primary"
              >
                Claim all
              </Button>
            </Popover>
          </MetricContainer>
          <MetricContainer>
            <BuilderLastCycleRewards {...rest} />
          </MetricContainer>
          <MetricContainer>
            <BuilderEstimatedRewards builder={builder} {...rest} />
          </MetricContainer>
          <MetricContainer>
            <BuilderAllTimeRewards {...rest} />
          </MetricContainer>
          <MetricContainer>
            <BuilderAllTimeShare {...rest} />
          </MetricContainer>
        </div>
      </PricesContextProvider>
    </CycleContextProvider>
  )
}
