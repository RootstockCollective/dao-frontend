import { FC } from 'react'
import { Address } from 'viem'
import {
  useClaimBuilderRewards,
  useClaimStateReporting,
  BuilderLastCycleRewards,
  BuilderClaimableRewards,
  BuilderAllTimeRewards,
  BuilderEstimatedRewards,
  BuilderAllTimeShare,
  RewardDetails,
} from '@/app/collective-rewards/rewards'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { PricesContextProvider } from '@/shared/context/PricesContext'
import { Popover } from '@/components/Popover'
import { Button } from '@/components/Button'
import { Paragraph } from '@/components/Typography'

type RewardsProps = RewardDetails

export const Rewards: FC<RewardsProps> = ({ builder, ...rest }) => {
  const { isClaimFunctionReady, claimRewards, ...claimTx } = useClaimBuilderRewards(builder)

  useClaimStateReporting({ ...claimTx })

  return (
    <div className="grid grid-cols-5 gap-[16px]">
      <CycleContextProvider>
        <PricesContextProvider>
          <BuilderClaimableRewards builder={builder} {...rest} />
          <BuilderLastCycleRewards {...rest} />
          <BuilderEstimatedRewards builder={builder} {...rest} />
          <BuilderAllTimeRewards {...rest} />
          <BuilderAllTimeShare {...rest} />
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
        </PricesContextProvider>
      </CycleContextProvider>
    </div>
  )
}
