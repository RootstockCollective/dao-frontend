import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils/formatter'
import { Builder } from '@/app/collective-rewards/types'
import { RIF } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC, useContext } from 'react'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { BuilderCard } from './BuilderCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export interface BuilderCardContainerProps extends Builder {
  backerRewardPercentage: NonNullable<Builder['backerRewardPercentage']>
  estimatedRewards?: string
  allocationTxPending?: boolean
}

export const BuilderCardContainer: FC<BuilderCardContainerProps> = ({
  allocationTxPending = false,
  address: builderAddress,
  ...props
}) => {
  const { isConnected } = useAccount()
  const { prices } = usePricesContext()
  const {
    actions: { updateAllocation },
    state: {
      backer: { balance, amountToAllocate },
      allocations,
    },
    initialState,
  } = useContext(AllocationsContext)
  const rifPriceUsd = prices[RIF]?.price ?? 0
  const allocation = Number(formatSymbol(allocations[builderAddress], 'stRIF'))
  const existentAllocation = Number(formatSymbol(initialState.allocations[builderAddress], 'stRIF'))

  if (allocation === undefined || existentAllocation === undefined) {
    return <LoadingSpinner />
  }

  const unallocatedAmount = Number(formatSymbol(balance - amountToAllocate, 'stRIF'))

  const handleAllocationChange = (value: number) => {
    if (allocationTxPending) return

    updateAllocation(builderAddress, parseEther(value.toString()))
  }

  return (
    <BuilderCard
      {...props}
      address={builderAddress}
      isConnected={isConnected}
      rifPriceUsd={rifPriceUsd}
      allocation={allocation}
      existentAllocation={existentAllocation}
      allocationTxPending={allocationTxPending}
      onAllocationChange={handleAllocationChange}
      maxAllocation={unallocatedAmount}
    />
  )
}
