import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { Builder } from '@/app/collective-rewards/types'
import { RIF } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC, useContext, useEffect, useState } from 'react'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { BuilderCard } from './BuilderCard'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { ActionsContainer } from '@/components/containers/ActionsContainer'
import { Button } from '@/components/ButtonNew/Button'
import { useAllocateVotes } from '@/app/collective-rewards/allocations/hooks/useAllocateVotes'
import { floorToUnit, getBuilderColor } from '../utils'

export interface BuilderCardControlProps extends Builder {
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
      resetVersion,
      backer: { balance, cumulativeAllocation },
      allocations,
    },
    initialState: { allocations: initialAllocations },
  } = useContext(AllocationsContext)
  const [isPendingSaveAllocations, setIsPendingSaveAllocations] = useState(false)

  const {
    saveAllocations,
    canSaveAllocation,
    isSuccess: isSuccessSaveAllocations,
    isPendingTx,
  } = useAllocateVotes()

  const rifPriceUsd = prices[RIF]?.price ?? 0
  const allocation = allocations[builderAddress] ?? 0n
  const existentAllocation = initialAllocations[builderAddress] ?? 0n
  const unallocatedAmount = floorToUnit(balance - (cumulativeAllocation - allocation))

  const onSaveAllocations = () => {
    setIsPendingSaveAllocations(true)
    saveAllocations()
  }

  useEffect(() => {
    if (isSuccessSaveAllocations) {
      closeDrawer()
    }
    setIsPendingSaveAllocations(false)
  }, [isSuccessSaveAllocations, closeDrawer])

  useEffect(() => {
    if (isPendingTx) {
      setIsPendingSaveAllocations(true)
    }
  }, [isPendingTx])

  const handleAllocationChange = (value: number) => {
    if (allocationTxPending) return
    updateAllocation(builderAddress, parseEther(value.toString()))

    if (!canSaveAllocation) return

    openDrawer(
      <ActionsContainer className="bg-v3-bg-accent-60">
        <div className="flex justify-center gap-2 w-full">
          <Button
            variant="secondary-outline"
            onClick={() => {
              resetAllocations()
              closeDrawer()
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onSaveAllocations}
            // FIXME: disabled status to be confirmed by UX
            disabled={isPendingSaveAllocations}
          >
            Save new backing amounts
          </Button>
        </div>
      </ActionsContainer>,
      true,
    )
  }

  return (
    <BuilderCard
      key={resetVersion}
      {...props}
      address={builderAddress}
      isConnected={isConnected}
      rifPriceUsd={rifPriceUsd}
      allocation={allocation}
      existentAllocation={existentAllocation}
      allocationTxPending={allocationTxPending}
      onAllocationChange={handleAllocationChange}
      maxAllocation={unallocatedAmount}
      topBarColor={getBuilderColor(builderAddress)}
    />
  )
}
