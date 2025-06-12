import { useCanManageAllocations } from '@/app/collective-rewards/allocations/hooks'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import {
  BackerRewards,
  BackerRewardsContextProvider,
  BackerRewardsTable,
  BuilderRewards,
  RewardDetails,
  RewardsSection,
  RewardsSectionHeader,
  SettingsButton,
  useBackerRewardsContext,
  useIsBacker,
} from '@/app/collective-rewards/rewards'
import { CRWhitepaperLink } from '@/app/collective-rewards/shared'
import { RequiredBuilder } from '@/app/collective-rewards/types'
import { useGetBuildersByState } from '@/app/collective-rewards/user'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Switch, SwitchThumb } from '@/components/Switch'
import { Typography } from '@/components/Typography'
import { getTokens } from '@/lib/tokens'
import { useReadBuilderRegistry } from '@/shared/hooks/contracts'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FC } from 'react'
import { Address, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

const SubText = () => (
  <>
    Track and claim the rewards you earn from Collective Rewards. For more information check the{' '}
    <CRWhitepaperLink />.
  </>
)

const NotBacking = () => {
  const router = useRouter()
  return (
    <div className="flex flex-col gap-y-[32px] items-center justify-center">
      <div className="flex flex-col gap-y-[8px] items-center">
        <Typography tagVariant="label" className="text-2xl font-normal font-kk-topo leading-[33.60px]">
          Not backing any builder yet.
        </Typography>
        <Typography tagVariant="label" className="text-base font-normal font-rootstock-sans leading-snug">
          Support builders by allocating your stRIF and start earning rewards.
        </Typography>
      </div>
      <div>
        <Button
          variant="white-new"
          data-testid="BrowBuildersButton"
          onClick={() => router.push('/collective-rewards')}
        >
          Browse Builders
        </Button>
      </div>
      <Image src="/images/my-rewards-empty-state.png" alt="my-rewards-empty-state" width={674} height={400} />
    </div>
  )
}

const RewardsContent: FC<RewardDetails> = data => {
  const { builder } = data

  // We don't need to show the loading state for the backer rewards since the parent already has a loading state
  const { data: isBacker, isLoading: isBackerLoading, error: backerError } = useIsBacker(builder)
  const {
    data: gauge,
    isLoading: gaugeLoading,
    error: gaugeError,
  } = useReadBuilderRegistry({
    functionName: 'builderToGauge',
    args: [builder],
  })

  const error = gaugeError ?? backerError
  const isLoading = isBackerLoading || gaugeLoading

  useHandleErrors({ error, title: 'Error loading user data' })

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <>
      {gauge && gauge !== zeroAddress && (
        <div className="pb-[46px]">
          <BuilderRewardsSection gauge={gauge} {...data} />
        </div>
      )}
      {isBacker ? (
        <BackerRewardsContextProvider backer={builder} {...data}>
          <BackerRewardsSection {...data} />
        </BackerRewardsContextProvider>
      ) : (
        <NotBacking />
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

export const Rewards: FC = () => {
  const { address, isConnected } = useAccount()
  const { data: activatedBuilders, error: activatedBuildersError } = useGetBuildersByState<RequiredBuilder>({
    activated: true,
  })
  const activatedGauges = activatedBuilders?.map(({ gauge }) => gauge) ?? []

  useHandleErrors({ error: activatedBuildersError, title: 'Error loading gauges' })

  if (!isConnected) {
    return <NotBacking />
  }

  // TODO: check where to store this information
  const data: RewardDetails = {
    builder: address!,
    gauges: activatedGauges,
    tokens: getTokens(),
  }

  return (
    <CycleContextProvider>
      <RewardsContent {...data} />
    </CycleContextProvider>
  )
}
