'use client'

import { useAccount } from 'wagmi'
import { useContext } from 'react'
import { usePricesContext } from '@/shared/context/PricesContext'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context/AllocationsContext'
import { RIF } from '@/lib/constants'
import { AvailableBackingMetric, TotalBackingMetric } from './components'
import {
  ActionMetricsContainer,
  ActionsContainer,
  InfoContainer,
  MetricsContainer,
  PageTitleContainer,
} from '@/components/containers'
import { BuildersSpotlight } from '@/app/backing/components/BuildersSpotlight/BuildersSpotlight'
import { BackingBanner } from '@/app/backing/components/BackingBanner/BackingBanner'
import { BackingInfoContainer } from '@/app/backing/components/Container/BackingInfoContainer/BackingInfoContainer'
import { AnnualBackersIncentivesMetric } from '@/app/backing/components/Metrics/AnnualBackersIncentivesMetric'
import { EstimatedRewardsMetric } from '@/app/backing/components/Metrics/EstimatedRewardsMetric'
import { useGetBuildersRewards } from '@/app/collective-rewards/rewards/builders/hooks/useGetBuildersRewards'
import { getTokens } from '@/lib/tokens'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const NAME = 'Backing'
export const BackingPage = () => {
  const { address } = useAccount()
  const { data: rewardsData, error: rewardsError } = useGetBuildersRewards(getTokens())
  useHandleErrors({ error: rewardsError, title: 'Error loading builder rewards' })
  const { prices } = usePricesContext()
  // TODO: add useAllocationsContext hook?
  const { state } = useContext(AllocationsContext)
  const votingPower = state.backer.balance
  const totalOnchainAllocation = state.backer.amountToAllocate
  const rifPriceUsd = prices[RIF]?.price ?? 0

  const availableForBacking =
    !votingPower || !totalOnchainAllocation ? 0 : Number(votingPower - totalOnchainAllocation)

  const totalBacking = !totalOnchainAllocation ? 0 : Number(totalOnchainAllocation)

  const availableBackingUSD = !availableForBacking || !rifPriceUsd ? 0 : availableForBacking * rifPriceUsd

  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm">
      <PageTitleContainer leftText={NAME} className="mb-8" />
      <div data-testid="CenterContainer" className="flex w-full items-stretch gap-2">
        <BackingInfoContainer
          className="grow-[9] h-full"
          title="Support innovative Builders by allocating your stRIF to those you align with."
        >
          <BackingBanner />
        </BackingInfoContainer>
        <MetricsContainer className="grow-[3] h-full">
          <AnnualBackersIncentivesMetric />
          <EstimatedRewardsMetric rewardsData={rewardsData} />
        </MetricsContainer>
      </div>

      {address && (
        <ActionMetricsContainer className="flex flex-col items-start w-[1144px] p-6 gap-2 rounded-[4px] bg-[#25211E] [&>div]:w-full">
          <AvailableBackingMetric
            availableForBacking={availableForBacking}
            availableBackingUSD={availableBackingUSD}
            onStakeClick={() => {
              // FIXME: Implement staking page and update this navigation
            }}
            onDistributeClick={() => {
              // TODO: Implement distribute functionality
            }}
          />
          <TotalBackingMetric totalBacking={totalBacking} />
        </ActionMetricsContainer>
      )}
      {/* </ActionMetricsContainer>} */}
      <ActionsContainer title="BUILDERS THAT YOU MAY WANT TO BACK">
        <BuildersSpotlight rewardsData={rewardsData} />
      </ActionsContainer>
    </div>
  )
}
