import {
  BackerRewards,
  BuilderRewards,
  RewardDetails,
  RewardsSection,
  RewardsSectionHeader,
} from '@/app/collective-rewards/rewards'
import { useGetGaugesArray } from '@/app/collective-rewards/user'
import { getCoinbaseAddress } from '@/app/collective-rewards/utils'
import { tokenContracts } from '@/lib/contracts'
import { useRouter } from 'next/navigation'
import { FC } from 'react'
import { Address, getAddress } from 'viem'

export const Rewards: FC<{ builder: Address; gauge: Address }> = ({ builder, gauge }) => {
  const router = useRouter()
  const { data: rewardGauges } = useGetGaugesArray('active')
  const { data: haltedGauges } = useGetGaugesArray('halted')
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
            onSettingsOpen={() => {
              router.push('/user/settings?type=builder')
            }}
            title="Builder Rewards"
            subtext="Monitor the rewards you are getting from your Collective Rewards."
          />
          <BuilderRewards {...data} />
        </RewardsSection>
      </div>
      <RewardsSection>
        <RewardsSectionHeader
          onSettingsOpen={() => {
            console.error('Not implemented')
          }}
          title="Backer Rewards"
          subtext="Monitor your rewards balances and claim."
        />
        <BackerRewards {...data} />
      </RewardsSection>
    </>
  )
}
