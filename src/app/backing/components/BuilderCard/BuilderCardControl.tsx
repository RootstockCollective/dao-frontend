import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { BackerRewardPercentage } from '@/app/collective-rewards/rewards/types'
import { Builder } from '@/app/collective-rewards/types'
import { RIF } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC, useContext } from 'react'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { BuilderCard } from './BuilderCard'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { ActionsContainer } from '@/components/containers/ActionsContainer'
import { Button } from '@/components/Button'
import { useAllocateVotes } from '@/app/collective-rewards/allocations/hooks/useAllocateVotes'

export interface BuilderCardControlProps extends Builder {
  backerRewardPct: BackerRewardPercentage
  allocationTxPending?: boolean
}

export const BuilderCardControl: FC<BuilderCardControlProps> = ({
  allocationTxPending = false,
  address: builderAddress,
  ...props
}) => {
  const { isConnected } = useAccount()
  const { prices } = usePricesContext()
  const { openDrawer, closeDrawer } = useLayoutContext()
  const {
    actions: { updateAllocation, resetAllocations },
    state: {
      backer: { balance, amountToAllocate },
      allocations,
    },
    initialState: { allocations: initialAllocations },
  } = useContext(AllocationsContext)

  const { saveAllocations, canSaveAllocation } = useAllocateVotes()

  const rifPriceUsd = prices[RIF]?.price ?? 0
  const allocation = allocations[builderAddress] ?? 0n
  const existentAllocation = initialAllocations[builderAddress] ?? 0n
  const unallocatedAmount = balance - amountToAllocate

  const handleAllocationChange = (value: number) => {
    if (allocationTxPending) return
    updateAllocation(builderAddress, parseEther(value.toString()))

    if (!canSaveAllocation) return

    openDrawer(
      <ActionsContainer className="gap-0">
        <div className="flex justify-center gap-2 w-full">
          <Button
            variant="secondary"
            onClick={() => {
              resetAllocations()
              closeDrawer()
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={saveAllocations}>
            Save new backing amounts
          </Button>
        </div>
      </ActionsContainer>,
    )
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
