'use client'

import { BackingBanner } from '@/app/backing/components/BackingBanner/BackingBanner'
import { BackingInfoTitleControl } from '@/app/backing/components/BackingInfoTitle/BackingInfoTitleControl'
import { BackingInfoContainer } from '@/app/backing/components/Container/BackingInfoContainer/BackingInfoContainer'
import { AnnualBackersIncentives } from '@/app/backing/components/Metrics/AnnualBackersIncentives'
import { EstimatedRewardsMetric } from '@/app/backing/components/Metrics/EstimatedRewardsMetric'
import { Allocations, useAllocationsContext, useBuilderContext } from '@/app/context'
import { formatSymbol, getFiatAmount } from '@/app/utils'
import { ActionMetricsContainer, ActionsContainer, MetricsContainer } from '@/components/containers'
import { Header, Span } from '@/components/TypographyNew'
import { RIF, stRIF, USD } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useContext, useMemo } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { AvailableBackingMetric, TotalBackingMetric } from './components'
import { BuilderAllocationBar } from './components/BuilderAllocationBar'
import { AnnualBackingIncentives } from './components/Metrics/AnnualBackingIncentives'
import { Spotlight } from './components/Spotlight'

const NAME = 'Backing'

export const BackingPage = () => {
  const { isConnected } = useAccount()
  const { prices } = usePricesContext()
  const {
    state: {
      allocations,
      backer: { balance: votingPower, amountToAllocate: totalOnchainAllocation, allocationsCount },
    },
    actions: { updateAllocations, updateAmountToAllocate },
  } = useAllocationsContext()

  const { randomBuilders } = useBuilderContext()
  const router = useRouter()

  const searchParams = useSearchParams()
  const userSelections = useMemo(() => searchParams.get('builders')?.split(',') as Address[], [searchParams])

  const rifPriceUsd = useMemo(() => prices[RIF]?.price ?? 0, [prices])

  const availableForBacking = useMemo(
    () => (!votingPower ? 0n : votingPower - totalOnchainAllocation),
    [votingPower, totalOnchainAllocation],
  )

  const totalBacking = useMemo(
    () => (!totalOnchainAllocation ? 0n : totalOnchainAllocation),
    [totalOnchainAllocation],
  )

  const hasAllocations = useMemo(() => {
    return isConnected && totalOnchainAllocation > 0n
  }, [totalOnchainAllocation, isConnected])

  // Format values properly using formatter functions
  const availableForBackingLabel = useMemo(
    () => formatSymbol(availableForBacking, stRIF),
    [availableForBacking],
  )
  const totalBackingLabel = useMemo(() => formatSymbol(totalBacking, stRIF), [totalBacking])
  const availableBackingUSD = useMemo(() => {
    return !availableForBacking || !rifPriceUsd
      ? formatCurrency(0, { currency: USD, showCurrency: true })
      : formatCurrency(getFiatAmount(availableForBacking, rifPriceUsd), {
          currency: USD,
          showCurrency: true,
        })
  }, [availableForBacking, rifPriceUsd])
  const handleDistributeClick = () => {
    //FIXME: Take into the inactive builders
    updateAmountToAllocate(votingPower)
    let newAllocations: Allocations = {}
    if (allocationsCount > 0) {
      newAllocations = Object.keys(allocations).reduce((acc, key) => {
        const builderAddress = key as Address
        const newAllocation = availableForBacking / BigInt(allocationsCount) + allocations[builderAddress]
        acc[builderAddress] = newAllocation

        return acc
      }, {} as Allocations)
    }

    const buildersAllocations =
      allocationsCount > 0
        ? newAllocations
        : randomBuilders.reduce((acc, builder) => {
            acc[builder.address] = availableForBacking / BigInt(randomBuilders.length)
            return acc
          }, {} as Allocations)
    updateAllocations(buildersAllocations)
  }

  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm">
      <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
        {NAME}{' '}
        {isConnected && allocationsCount > 0 && (
          <Span variant="tag" className="text-v3-bg-accent-0 text-lg font-normal normal-case">
            {allocationsCount} Builders
          </Span>
        )}
      </Header>
      {!hasAllocations && (
        <div data-testid="CenterContainer" className="flex w-full items-stretch gap-2">
          <BackingInfoContainer title={<BackingInfoTitleControl />}>
            <BackingBanner />
          </BackingInfoContainer>
          <MetricsContainer className="grow-[3] h-full bg-v3-bg-accent-80">
            <AnnualBackersIncentives />
            <EstimatedRewardsMetric />
          </MetricsContainer>
        </div>
      )}

      {/* FIXME: we need to change the conditions to show the BuilderAllocationBar */}
      {isConnected && <BuilderAllocationBar />}

      {isConnected && (
        <ActionMetricsContainer className="flex flex-col w-full items-start p-6 gap-2 rounded-[4px] bg-v3-bg-accent-80">
          <div className="flex flex-col items-center gap-10 w-full">
            <div className="flex items-start gap-14 w-full">
              <div className="basis-1/2">
                <AvailableBackingMetric
                  availableForBacking={availableForBackingLabel}
                  availableBackingUSD={availableBackingUSD}
                  onStakeClick={() => router.push('/user?action=stake')}
                  onDistributeClick={handleDistributeClick}
                />
              </div>
              <div className="flex items-start basis-1/2 gap-14">
                <div className="basis-1/2">
                  <TotalBackingMetric totalBacking={totalBackingLabel} />
                </div>
                {hasAllocations && (
                  <div className="basis-1/2">
                    <AnnualBackingIncentives />
                  </div>
                )}
              </div>
            </div>
            {(hasAllocations || userSelections) && <Spotlight />}
          </div>
        </ActionMetricsContainer>
      )}

      {!hasAllocations && !userSelections && (
        <ActionsContainer
          title={
            <Header variant="h3" caps>
              {isConnected ? 'Builders that you may want to back' : 'In the spotlight'}
            </Header>
          }
          className="bg-v3-bg-accent-80"
        >
          <Spotlight />
        </ActionsContainer>
      )}
    </div>
  )
}
