import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { Builder } from '@/app/collective-rewards/types'
import { RIF } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { createContext, FC, useCallback, useContext, useEffect } from 'react'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { BuilderCard } from './BuilderCard'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { ActionsContainer } from '@/components/containers/ActionsContainer'
import { Button } from '@/components/ButtonNew/Button'
import { useAllocateVotes } from '@/app/collective-rewards/allocations/hooks/useAllocateVotes'
import { floorToUnit, getBuilderColor } from '../utils'
import { TransactionInProgressButton } from '@/app/user/Stake/components/TransactionInProgressButton'

export interface BuilderCardControlProps extends Builder {
  allocationTxPending?: boolean
}

const AllocationDrawerContent = ({
  onSaveAllocations,
  onCancelAllocations,
}: {
  onSaveAllocations: () => void
  onCancelAllocations: () => void
}) => {
  const { isPendingTx, isLoadingReceipt } = useAllocateVotes()
  useEffect(() => {
    console.log('### isPendingTx', isPendingTx)
  }, [isPendingTx])
  return (
    <ActionsContainer className="bg-v3-bg-accent-60">
      <div className="flex justify-center gap-2 w-full">
        <Button variant="secondary-outline" onClick={onCancelAllocations}>
          Cancel
        </Button>
        {isPendingTx || isLoadingReceipt ? (
          <TransactionInProgressButton />
        ) : (
          <Button variant="primary" onClick={onSaveAllocations}>
            Save new backing amounts
          </Button>
        )}
      </div>
    </ActionsContainer>
  )
}

export const BuilderCardControl: FC<BuilderCardControlProps> = ({
  allocationTxPending = false,
  address: builderAddress,
  ...props
}) => {
  const { isConnected } = useAccount()
  const { prices } = usePricesContext()
  const { openDrawer, closeDrawer, isDrawerOpen } = useLayoutContext()
  const {
    actions: { updateAllocation, resetAllocations },
    state: {
      resetVersion,
      backer: { balance, cumulativeAllocation },
      allocations,
    },
    initialState: { allocations: initialAllocations },
  } = useContext(AllocationsContext)

  const { saveAllocations, canSaveAllocation, isPendingTx, isLoadingReceipt, isSuccess } = useAllocateVotes()

  const rifPriceUsd = prices[RIF]?.price ?? 0
  const allocation = allocations[builderAddress] ?? 0n
  const existentAllocation = initialAllocations[builderAddress] ?? 0n
  const unallocatedAmount = floorToUnit(balance - (cumulativeAllocation - allocation))

  const onSaveAllocations = () => {
    saveAllocations()
    // if (isDrawerOpen) {
    //   openDrawer(
    //     <AllocationDrawerContent
    //       onSaveAllocations={onSaveAllocations}
    //       onCancelAllocations={onCancelAllocations}
    //     />,
    //     true,
    //   )
    // }
  }

  const onCancelAllocations = () => {
    resetAllocations()
    closeDrawer()
  }

  // useEffect(() => {
  //   if (isDrawerOpen) {
  //     openOrUpdateAllocationDrawer()
  //   }
  // }, [isPendingTx])

  useEffect(() => {
    if (isSuccess) {
      closeDrawer()
    }
  }, [isSuccess, closeDrawer])

  // const openOrUpdateAllocationDrawer = useCallback(() => {
  //   openDrawer(
  //     <AllocationDrawerContent
  //       onSaveAllocations={onSaveAllocations}
  //       onCancelAllocations={onCancelAllocations}
  //     />,
  //     true,
  //   )
  // }, [openDrawer, onSaveAllocations, onCancelAllocations, isPendingTx, isLoadingReceipt])

  const handleAllocationChange = (value: number) => {
    if (allocationTxPending) return
    updateAllocation(builderAddress, parseEther(value.toString()))

    if (!canSaveAllocation) return

    openDrawer(
      <AllocationDrawerContent
        onSaveAllocations={onSaveAllocations}
        onCancelAllocations={onCancelAllocations}
      />,
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
