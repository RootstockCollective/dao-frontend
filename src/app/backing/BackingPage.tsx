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

const NAME = 'Backing'
export const BackingPage = () => {
  const { address } = useAccount()
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
    <div
      data-testid={NAME}
      className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-10 rounded-sm"
    >
      <PageTitleContainer leftText={NAME}>
        {/* TODO: ADD CHILDREN HERE OR TEXT IN LEFT_TEXT */}
      </PageTitleContainer>
      <div data-testid="CenterContainer" className="flex w-full items-start gap-2">
        <InfoContainer className="grow-[9]">{/* TODO: ADD CHILDREN HERE */}</InfoContainer>
        <MetricsContainer></MetricsContainer>
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
      <ActionsContainer title="TODO: ADD TITLE COMPONENT" />
    </div>
  )
}
