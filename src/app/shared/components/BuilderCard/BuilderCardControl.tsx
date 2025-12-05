import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { useAllocateVotes } from '@/app/collective-rewards/allocations/hooks/useAllocateVotes'
import { TokenRewards } from '@/app/collective-rewards/rewards'
import { Builder } from '@/app/collective-rewards/types'
import { TransactionInProgressButton } from '@/app/user/Stake/components/TransactionInProgressButton'
import { Button } from '@/components/Button'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { ActionsContainer } from '@/components/containers/ActionsContainer'
import { usePricesContext } from '@/shared/context'
import { useRouter } from 'next/navigation'
import { FC, useContext, useEffect } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { BuilderCard } from './BuilderCard'

export interface BuilderCardControlProps {
  builder: Builder
  estimatedRewards?: TokenRewards
  isInteractive?: boolean
  index?: number
  showAnimation?: boolean
}

const AllocationDrawerContent = () => {
  const { saveAllocations, isSuccess } = useAllocateVotes()

  const { closeDrawer } = useLayoutContext()
  const {
    state: { isAllocationTxPending },
    actions: { resetAllocations },
  } = useContext(AllocationsContext)

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
    <ActionsContainer className="bg-v3-bg-accent-60" containerClassName="flex flex-row">
      <div className="flex justify-center gap-2 w-full">
        <Button variant="secondary-outline" onClick={onCancelAllocations} className="flex-1 md:flex-none">
          Cancel
        </Button>
        {isAllocationTxPending ? (
          <TransactionInProgressButton />
        ) : (
          <Button
            variant="primary"
            onClick={saveAllocations}
            className="whitespace-nowrap flex-4 md:flex-none"
          >
            Save new backing amounts
          </Button>
        )}
      </div>
    </ActionsContainer>
  )
}

export const BuilderCardControl: FC<BuilderCardControlProps> = ({
  builder,
  index,
  showAnimation = false,
  ...props
}) => {
  const { isConnected } = useAccount()
  const { prices } = usePricesContext()
  const { openDrawer, closeDrawer } = useLayoutContext()
  const router = useRouter()
  const {
    state: {
      resetVersion,
      allocations,
      backer: { balance, cumulativeAllocation: cumulativeBacking },
    },
    initialState: {
      allocations: initialAllocations,
      backer: { cumulativeAllocation: totalOnchainAllocation },
    },
    actions: { updateAllocation },
  } = useContext(AllocationsContext)

  const cumulativeBackingReductions = Object.entries(allocations).reduce((acc, [address, allocation]) => {
    const onchainAllocation = initialAllocations[address as Address] ?? 0n
    if (onchainAllocation > allocation) {
      acc += onchainAllocation - allocation
    }

    return acc
  }, 0n)
  const updatedBacking = allocations[builder.address] ?? 0n
  const currentBacking = initialAllocations[builder.address] ?? 0n

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
    <div key={builder.address} className="max-sm:flex-shrink-0 max-sm:snap-center flex max-xl:min-w-[268px]">
      <BuilderCard
        key={resetVersion}
        {...props}
        builder={builder}
        index={index}
        showAnimation={showAnimation}
        onConnect={() => router.push(`/backing?builders=${builder.address}`) /* 🤢 */}
        allocationInputProps={{
          builderAddress: builder.address,
          allocationTxPending: false, // TODO: this is not currently used on main
          disabled: false,
          balance,
          prices,
          onchainBackingState: {
            builderBacking: currentBacking,
            cumulativeBacking: totalOnchainAllocation,
          },
          updatedBackingState: {
            builderBacking: updatedBacking,
            cumulativeBacking,
            cumulativeBackingReductions: cumulativeBackingReductions,
          },
          updateBacking: (value: bigint) => updateAllocation(builder.address, value),
        }}
      />
    </div>
  )
}
