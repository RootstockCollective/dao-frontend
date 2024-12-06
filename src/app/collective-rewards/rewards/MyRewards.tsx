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
import { Link } from '@/components/Link'
import { useValidateBackerAllocations } from '@/app/collective-rewards/allocations/hooks'

const SubText = () => {
  return (
    <>
      Track and claim the rewards you earn from Collective Rewards. For more information check the{' '}
      <Link
        className="text-[#E56B1A]"
        href={
          'https://wiki.rootstockcollective.xyz/2c6e3b87b49f4c1e9225b713e1b49538?v=819168fca4964319896c19e8299a8ea0'
        }
        target="_blank"
      >
        Whitepaper
      </Link>{' '}
      .
    </>
  )
}

export const Rewards: FC<{ builder: Address }> = ({ builder }) => {
  const router = useRouter()
  const { data: gauges, error: gaugesError } = useGetGaugesArray()
  const { data: gauge, error: gaugeError } = useGetBuilderToGauge(builder)
  const canManageAllocations = useValidateBackerAllocations()

  const error = gaugesError ?? gaugeError

  useHandleErrors({ error, title: 'Error loading gauge(s)' })

  // TODO: check where to store this information
  const data: RewardDetails = {
    builder,
    gauges: gauges || [],
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
              subtext={<SubText />}
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
          subtext={<SubText />}
          settingsDisabled={canManageAllocations}
        />
        <BackerRewards {...data} />
        <BackerRewardsTable {...data} />
      </RewardsSection>
    </>
  )
}
