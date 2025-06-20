'use client'

import { useAccount } from 'wagmi'
import { useContext } from 'react'
import { usePricesContext } from '@/shared/context/PricesContext'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context/AllocationsContext'
import { RIF } from '@/lib/constants'
import { AvailableBackingMetric, TotalBackingMetric } from './components'
import { ActionMetricsContainer, ActionsContainer, MetricsContainer } from '@/components/containers'
import { BuildersSpotlight } from '@/app/backing/components/BuildersSpotlight/BuildersSpotlight'
import { BackingBanner } from '@/app/backing/components/BackingBanner/BackingBanner'
import { BackingInfoContainer } from '@/app/backing/components/Container/BackingInfoContainer/BackingInfoContainer'
import { BackingInfoTitleControl } from '@/app/backing/components/BackingInfoTitle/BackingInfoTitleControl'
import { AnnualBackersIncentivesMetric } from '@/app/backing/components/Metrics/AnnualBackersIncentivesMetric'
import { EstimatedRewardsMetric } from '@/app/backing/components/Metrics/EstimatedRewardsMetric'
import { useGetBuildersRewards } from '@/app/collective-rewards/rewards/builders/hooks/useGetBuildersRewards'
import { getTokens } from '@/lib/tokens'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Header } from '@/components/TypographyNew'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards'
import { formatCurrency } from '@/lib/utils'

const NAME = 'Backing'

export const BackingPage = () => {
  const { isConnected } = useAccount()
  const { data: rewardsData, error: rewardsError } = useGetBuildersRewards(getTokens())
  useHandleErrors({ error: rewardsError, title: 'Error loading builder rewards' })
  const { prices } = usePricesContext()
  // TODO: add useAllocationsContext hook?
  const {
    state: {
      backer: { balance: votingPower, amountToAllocate: totalOnchainAllocation },
    },
  } = useContext(AllocationsContext)
  const rifPriceUsd = prices[RIF]?.price ?? 0

  const availableForBackingBigInt = !votingPower ? 0n : votingPower - totalOnchainAllocation

  const totalBackingBigInt = !totalOnchainAllocation ? 0n : totalOnchainAllocation

  // Format values properly using formatter functions
  const availableForBacking = formatSymbol(availableForBackingBigInt, 'stRIF')
  const totalBacking = formatSymbol(totalBackingBigInt, 'stRIF')
  const availableBackingUSD =
    !availableForBackingBigInt || !rifPriceUsd
      ? formatCurrency(0)
      : formatCurrency(getFiatAmount(availableForBackingBigInt, rifPriceUsd))

  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm">
      <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
        {NAME}
      </Header>
      <div data-testid="CenterContainer" className="flex w-full items-stretch gap-2">
        <BackingInfoContainer className="grow-[9] h-full" title={<BackingInfoTitleControl />}>
          <BackingBanner />
        </BackingInfoContainer>
        <MetricsContainer className="grow-[3] h-full bg-v3-bg-accent-80">
          <AnnualBackersIncentivesMetric />
          <EstimatedRewardsMetric rewardsData={rewardsData} />
        </MetricsContainer>
      </div>

      {isConnected && (
        <ActionMetricsContainer className="flex flex-col items-start w-[1144px] p-6 gap-2 rounded-[4px] bg-v3-bg-accent-80 [&>div]:w-full">
          <AvailableBackingMetric
            availableForBacking={availableForBacking}
            availableBackingUSD={availableBackingUSD}
            onStakeClick={() => {
              // FIXME: Implement staking page and update this navigation
            }}
            onDistributeClick={() => {
              // FIXME: Implement distribute functionality
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
