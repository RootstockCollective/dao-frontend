import { FC } from 'react'
import { Address } from 'viem'
import { RewardsSection, RewardsSectionHeader } from './components'
import { useClaimAllRewards, useClaimStateReporting } from './hooks'

export const Rewards: FC<{ builder: Address }> = ({ builder }) => {
  const { isClaimFunctionReady, claimAllRewards, ...claimTx } = useClaimAllRewards(builder)

  useClaimStateReporting({ ...claimTx })

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
      </RewardsSection>
      <RewardsSection>
        <RewardsSectionHeader title="Backer Rewards" subtext="Monitor your rewards balances and claim." />
      </RewardsSection>
    </div>
  )
}
