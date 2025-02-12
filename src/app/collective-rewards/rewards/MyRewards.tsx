import {
  BackerRewards,
  BuilderRewards,
  RewardDetails,
  RewardsSection,
  RewardsSectionHeader,
  BackerRewardsTable,
  useIsBacker,
  SettingsButton,
  BackerRewardsContextProvider,
  useBackerRewardsContext,
} from '@/app/collective-rewards/rewards'
import { useGetBuildersByState, useGetBuilderToGauge } from '@/app/collective-rewards/user'
import { getCoinbaseAddress, useHandleErrors } from '@/app/collective-rewards/utils'
import { tokenContracts } from '@/lib/contracts'
import { FC } from 'react'
import { Address, getAddress, zeroAddress } from 'viem'
import { useRouter } from 'next/navigation'
import { useCanManageAllocations } from '@/app/collective-rewards/allocations/hooks'
import { CRWhitepaperLink } from '@/app/collective-rewards/shared'
import { RequiredBuilder } from '@/app/collective-rewards/types'
import { Switch, SwitchThumb } from '@/components/Switch'
import { Typography } from '@/components/Typography'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'

const SubText = () => {
  return (
    <>
      Track and claim the rewards you earn from Collective Rewards. For more information check the{' '}
      <CRWhitepaperLink />.
    </>
  )
}

const RewardsContent: FC<RewardDetails> = data => {
  const { builder } = data

  // We don't need to show the loading state for the backer rewards since the parent already has a loading state
  const { data: isBacker, error: backerError } = useIsBacker(builder)
  const { data: gauge, error: gaugeError } = useGetBuilderToGauge(builder)

  const error = gaugeError ?? backerError

  useHandleErrors({ error, title: 'Error loading gauge / isBacker' })

  return (
    <>
      {gauge && gauge !== zeroAddress && (
        <div className="pb-[46px]">
          <BuilderRewardsSection gauge={gauge} {...data} />
        </div>
      )}
      {isBacker && (
        <BackerRewardsContextProvider backer={builder} {...data}>
          <BackerRewardsSection {...data} />
        </BackerRewardsContextProvider>
      )}
    </>
  )
}

const BuilderRewardsSection: FC<RewardDetails & { gauge: Address }> = ({ gauge, ...data }) => {
  const router = useRouter()

  return (
    <RewardsSection>
      <RewardsSectionHeader
        title="Builder Rewards"
        subtext={<SubText />}
        utility={<SettingsButton onClick={() => router.push('/user/settings?type=builder')} />}
      />
      <BuilderRewards gauge={gauge} {...data} />
    </RewardsSection>
  )
}

const BackerRewardsSection: FC<RewardDetails> = data => {
  const router = useRouter()
  const canManageAllocations = useCanManageAllocations()
  const {
    detailedView: { value: isDetailedView, onChange: setIsDetailedView },
  } = useBackerRewardsContext()

  return (
    <RewardsSection>
      <RewardsSectionHeader
        isBacker={true}
        title="Backer Rewards"
        subtext={<SubText />}
        utility={
          <div className="flex gap-x-[12px]">
            <div className="flex flex-col items-center gap-y-[9px] w-[142px]">
              <Switch checked={isDetailedView} onCheckedChange={() => setIsDetailedView(!isDetailedView)}>
                <SwitchThumb />
              </Switch>
              <Typography tagVariant="label" className="text-xs font-normal font-rootstock-sans">
                Detailed View
              </Typography>
            </div>
            <SettingsButton
              disabled={!canManageAllocations}
              onClick={() => router.push('/collective-rewards/allocations')}
            />
          </div>
        }
      />
      <BackerRewards {...data} />
      <BackerRewardsTable {...data} />
    </RewardsSection>
  )
}

type RewardsProps = { builder: Address }
export const Rewards: FC<RewardsProps> = ({ builder }) => {
  const { data: activatedBuilders, error: activatedBuildersError } = useGetBuildersByState<RequiredBuilder>({
    activated: true,
  })
  const activatedGauges = activatedBuilders?.map(({ gauge }) => gauge) ?? []

  useHandleErrors({ error: activatedBuildersError, title: 'Error loading gauges' })

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
    <CycleContextProvider>
      <RewardsContent {...data} />
    </CycleContextProvider>
  )
}
