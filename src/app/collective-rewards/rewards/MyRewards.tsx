import {
  BackerRewards,
  BuilderRewards,
  RewardDetails,
  RewardsSection,
  RewardsSectionHeader,
} from '@/app/collective-rewards/rewards'
import { useGetBuilderToGauge, useGetGaugesArray } from '@/app/collective-rewards/user'
import { getCoinbaseAddress, useHandleErrors } from '@/app/collective-rewards/utils'
import { tokenContracts } from '@/lib/contracts'
import { FC } from 'react'
import { Address, getAddress, zeroAddress } from 'viem'
import { BackerRewardsTable } from './backers/BackerRewardsTable'
import { useRouter } from 'next/navigation'

export const Rewards: FC<{ builder: Address }> = ({ builder }) => {
  const router = useRouter()
  const { data: rewardGauges, error: rewardGaugesError } = useGetGaugesArray('active')
  const { data: haltedGauges, error: haltedGaugesError } = useGetGaugesArray('halted')
  const { data: gauge, error: gaugeError } = useGetBuilderToGauge(builder)
  const gauges = [...(rewardGauges ?? []), ...(haltedGauges ?? [])]

  const error = rewardGaugesError ?? haltedGaugesError ?? gaugeError

  useHandleErrors({ error, title: 'Error loading gauge(s)' })

  // TODO: check where to store this information
  const data: RewardDetails = {
    builder,
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
      {gauge && gauge !== zeroAddress && (
        <div className="pb-[46px]">
          <RewardsSection>
            <RewardsSectionHeader
              onSettingsOpen={() => {
                router.push('/user/settings?type=builder')
              }}
              title="Builder Rewards"
              subtext="Monitor the rewards you are getting from your Collective Rewards."
            />
            <BuilderRewards gauge={gauge} {...data} />
          </RewardsSection>
        </div>
      )}
      <RewardsSection>
        <RewardsSectionHeader
          onSettingsOpen={() => {
            router.push('/collective-rewards/allocations')
          }}
          title="Backer Rewards"
          subtext="Monitor your rewards balances and claim."
        />
        <BackerRewards {...data} />
        <BackerRewardsTable {...data} />
      </RewardsSection>
    </>
  )
}
