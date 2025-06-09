import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { BackerRewardPercentage } from '@/app/collective-rewards/rewards/types'
import { Builder } from '@/app/collective-rewards/types'
import { RIF } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC, useContext } from 'react'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { BuilderCard } from './BuilderCard'

export interface BuilderCardControlProps extends Builder {
  backerRewardPct: BackerRewardPercentage
  estimatedRewards?: string
  allocationTxPending?: boolean
}

export const BuilderCardControl: FC<BuilderCardControlProps> = ({
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
  const allocation = allocations[builderAddress] ?? 0n
  const existentAllocation = initialState.allocations[builderAddress] ?? 0n
  const unallocatedAmount = balance - amountToAllocate

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
