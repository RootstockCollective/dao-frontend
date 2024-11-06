import { FC } from 'react'
import { Address, getAddress } from 'viem'
import {
  RewardsSection,
  RewardsSectionHeader,
  useClaimBuilderRewards,
  useClaimStateReporting,
  LastCycleRewards,
  ClaimableRewards,
} from '@/app/collective-rewards/rewards'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { PricesContextProvider } from '@/shared/context/PricesContext'
import { getCoinBaseAddress } from '@/app/collective-rewards/utils'
import { tokenContracts } from '@/lib/contracts'
import { Popover } from '@/components/Popover'
import { Button } from '@/components/Button'
import { Paragraph } from '@/components/Typography'

export const Rewards: FC<{ builder: Address; gauge: Address }> = ({ builder, gauge }) => {
  const { isClaimFunctionReady, claimRewards, ...claimTx } = useClaimBuilderRewards(builder)

  useClaimStateReporting({ ...claimTx })

  const data = {
    rif: {
      address: getAddress(tokenContracts.RIF),
      symbol: 'RIF',
    },
    rbtc: {
      address: getCoinBaseAddress(),
      symbol: 'RBTC',
    },
  }

  return (
    <div
      id="my_rewards_container"
      className="flex flex-col flex-shrink-0 items-start self-stretch gap-[46px]"
    >
      <RewardsSection>
        <RewardsSectionHeader
          title="Builder Rewards"
          subtext="Monitor the rewards you are getting from your Collective Rewards."
        />
        <div className="grid grid-cols-5 gap-[16px]">
          <CycleContextProvider>
            <PricesContextProvider>
              <ClaimableRewards builder={builder} gauge={gauge} data={data} />
              <LastCycleRewards gauge={gauge} data={data} />
              <div>Estimated Rewards</div>
              <div>All time rewards</div>
              <div>All time share</div>
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
                <Button onClick={claimRewards} disabled={!isClaimFunctionReady} variant="primary">
                  Claim all
                </Button>
              </Popover>
            </PricesContextProvider>
          </CycleContextProvider>
        </div>
      </RewardsSection>
      <RewardsSection>
        <RewardsSectionHeader title="Backer Rewards" subtext="Monitor your rewards balances and claim." />
      </RewardsSection>
    </div>
  )
}
