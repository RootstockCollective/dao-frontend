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

export const Rewards: FC<{ builder: Address }> = ({ builder }) => {
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
          <BuilderRewards gauge={gauge} {...data} />
        </div>
      )}
      <RewardsSection>
        <RewardsSectionHeader
          onSettingsOpen={() => {
            console.error('Not implemented')
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
