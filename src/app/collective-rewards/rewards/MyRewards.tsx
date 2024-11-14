import { FC } from 'react'
import { Address, getAddress } from 'viem'
import {
  RewardsSection,
  RewardsSectionHeader,
  BuilderRewards,
  BackerRewards,
  RewardDetails,
} from '@/app/collective-rewards/rewards'
import { getCoinbaseAddress } from '@/app/collective-rewards/utils'
import { tokenContracts } from '@/lib/contracts'
import { useGetGaugesArray, useGetHaltedGaugesArray } from '@/app/collective-rewards/user'

export const Rewards: FC<{ builder: Address; gauge: Address }> = ({ builder, gauge }) => {
  const { data: rewardGauges } = useGetGaugesArray()
  const { data: haltedGauges } = useGetHaltedGaugesArray()
  const gauges = [...(rewardGauges ?? []), ...(haltedGauges ?? [])]

  const data: RewardDetails = {
    builder,
    gauge,
    gauges,
    tokens: {
      rif: {
        address: getAddress(tokenContracts.RIF),
        symbol: 'RIF',
      },
      rbtc: {
        address: getCoinbaseAddress(),
        symbol: 'RBTC',
      },
    },
  }

  return (
    <>
      <div className="pb-[46px]">
        <RewardsSection>
          <RewardsSectionHeader
            title="Builder Rewards"
            subtext="Monitor the rewards you are getting from your Collective Rewards."
          />
          <BuilderRewards {...data} />
        </RewardsSection>
      </div>
      <RewardsSection>
        <RewardsSectionHeader title="Backer Rewards" subtext="Monitor your rewards balances and claim." />
        <BackerRewards {...data} />
      </RewardsSection>
    </>
  )
}
