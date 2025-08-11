import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { useAllocateVotes } from '@/app/collective-rewards/allocations/hooks/useAllocateVotes'
import { Builder } from '@/app/collective-rewards/types'
import { TransactionInProgressButton } from '@/app/user/Stake/components/TransactionInProgressButton'
import { Button } from '@/components/Button/Button'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { ActionsContainer } from '@/components/containers/ActionsContainer'
import { RIF } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC, useContext, useEffect } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { floorToUnit, getBuilderColor } from '../utils'
import { BuilderCard } from './BuilderCard'
import { TokenRewards } from '@/app/collective-rewards/rewards'

export interface BuilderCardControlProps extends Builder {
  estimatedRewards?: TokenRewards
  allocationTxPending?: boolean
  isInteractive?: boolean
  index?: number
  showAnimation?: boolean
}

const AllocationDrawerContent = () => {
  const { saveAllocations, isPendingTx, isLoadingReceipt, isSuccess } = useAllocateVotes()

  const { closeDrawer } = useLayoutContext()
  const {
    actions: { resetAllocations },
  } = useContext(AllocationsContext)

  const onSaveAllocations = () => {
    saveAllocations()
  }
  const onCancelAllocations = () => {
    resetAllocations()
    closeDrawer()
  }

  useEffect(() => {
    if (isSuccess) {
      closeDrawer()
    }
  }, [isSuccess, closeDrawer])

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
  index,
  showAnimation = false,
  ...props
}) => {
  const { isConnected } = useAccount()
  const { prices } = usePricesContext()
  const { openDrawer, closeDrawer } = useLayoutContext()
  const {
    actions: { updateAllocation },
    state: {
      resetVersion,
      backer: { balance, cumulativeAllocation },
      allocations,
    },
    initialState: { allocations: initialAllocations },
  } = useContext(AllocationsContext)

  const rifPriceUsd = prices[RIF]?.price ?? 0
  const allocation = allocations[builderAddress] ?? 0n
  const existentAllocation = initialAllocations[builderAddress] ?? 0n
  const unallocatedAmount = floorToUnit(balance - (cumulativeAllocation - allocation))
  const topBarColor = getBuilderColor(builderAddress)

  const handleAllocationChange = (value: bigint) => {
    if (allocationTxPending) return
    updateAllocation(builderAddress, value)
  }

  useEffect(() => {
    // Compare initialAllocations and allocations
    // Find differences between initial and current allocations for this builder
    const uniqueAddresses = [...new Set([...Object.keys(initialAllocations), ...Object.keys(allocations)])]
    const hasChanged = uniqueAddresses.some(
      builderAddress =>
        (initialAllocations[builderAddress as Address] || 0n) !==
        (allocations[builderAddress as Address] || 0n),
    )

    if (hasChanged && isConnected) {
      openDrawer(<AllocationDrawerContent />, true)
    } else {
      closeDrawer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAllocations, allocations])

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
      topBarColor={allocation > 0n && isConnected ? topBarColor : 'transparent'}
      index={index}
      showAnimation={showAnimation}
    />
  )
}
