import {
  BackerRewards,
  BuilderRewards,
  RewardDetails,
  RewardsSection,
  RewardsSectionHeader,
  BackerRewardsTable,
} from '@/app/collective-rewards/rewards'
import { useGetBuildersByState, useGetBuilderToGauge } from '@/app/collective-rewards/user'
import { getCoinbaseAddress, useHandleErrors } from '@/app/collective-rewards/utils'
import { tokenContracts } from '@/lib/contracts'
import { FC } from 'react'
import { Address, getAddress, zeroAddress } from 'viem'
import { useRouter } from 'next/navigation'
import { Link } from '@/components/Link'
import { Builder } from '../types'
import { useCanManageAllocations } from '@/app/collective-rewards/allocations/hooks'

const SubText = () => {
  return (
    <>
      Track and claim the rewards you earn from Collective Rewards. For more information check the{' '}
      <Link
        className="text-[#E56B1A]"
        href={
          'https://file.notion.so/f/f/5c274ed5-ccaa-43f3-9086-7ff7fed02299/2d5ab5ff-a08b-428f-b8ef-1fb642dcaf42/20241128_RootstockCollective_Rewards_Whitepaper_V1_0.pdf?table=block&id=14c1ca6b-0b02-8093-beba-c642396e4e09&spaceId=5c274ed5-ccaa-43f3-9086-7ff7fed02299&expirationTimestamp=1733918400000&signature=0fXpO_3zOse-KRipYdYjHuOFRMqBcbKy5gHR2T5yyZQ&downloadName=20241128_RootstockCollective_Rewards_Whitepaper_V1_0.pdf'
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        Whitepaper
      </Link>{' '}
      .
    </>
  )
}

export const Rewards: FC<{ builder: Address }> = ({ builder }) => {
  const router = useRouter()
  const { data: activatedBuilders, error: activatedBuildersError } = useGetBuildersByState<Required<Builder>>(
    {
      activated: true,
    },
  )
  const activatedGauges = activatedBuilders?.map(({ gauge }) => gauge) ?? []
  const { data: gauge, error: gaugeError } = useGetBuilderToGauge(builder)
  const canManageAllocations = useCanManageAllocations()

  const error = activatedBuildersError ?? gaugeError

  useHandleErrors({ error, title: 'Error loading gauge(s)' })

  // TODO: check where to store this information
  const data: RewardDetails = {
    builder,
    gauges: activatedGauges,
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
          showSettingsButton={canManageAllocations}
        />
        <BackerRewards {...data} />
        <BackerRewardsTable {...data} />
      </RewardsSection>
    </>
  )
}
