'use client'

import { BackingBanner } from '@/app/backing/components/BackingBanner/BackingBanner'
import { BackingInfoTitleControl } from '@/app/backing/components/BackingInfoTitle/BackingInfoTitleControl'
import { BuildersSpotlight } from '@/app/backing/components/BuildersSpotlight/BuildersSpotlight'
import { BackingInfoContainer } from '@/app/backing/components/Container/BackingInfoContainer/BackingInfoContainer'
import { AnnualBackersIncentives } from '@/app/backing/components/Metrics/AnnualBackersIncentives'
import { EstimatedRewardsMetric } from '@/app/backing/components/Metrics/EstimatedRewardsMetric'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context/AllocationsContext'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards'
import { useGetBuildersRewards } from '@/app/collective-rewards/rewards/builders/hooks/useGetBuildersRewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { ActionMetricsContainer, ActionsContainer, MetricsContainer } from '@/components/containers'
import { Header } from '@/components/TypographyNew'
import { RIF } from '@/lib/constants'
import { getTokens } from '@/lib/tokens'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useContext } from 'react'
import { useAccount } from 'wagmi'
import { AvailableBackingMetric, TotalBackingMetric } from './components'
import { BuilderAllocationBar } from './components/BuilderAllocationBar'

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
      ? formatCurrency(0, { currency: 'USD', showCurrency: true })
      : formatCurrency(getFiatAmount(availableForBackingBigInt, rifPriceUsd), {
          currency: 'USD',
          showCurrency: true,
        })

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
          <AnnualBackersIncentives />
          <EstimatedRewardsMetric rewardsData={rewardsData} />
        </MetricsContainer>
      </div>

      <BuilderAllocationBar />

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
      <ActionsContainer
        title={
          <Header caps variant="h3">
            builders that you may want to back
          </Header>
        }
      >
        <BuildersSpotlight rewardsData={rewardsData} />
      </ActionsContainer>
    </div>
  )
}
