import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { isBuilderRewardable } from '@/app/collective-rewards/utils'
import { floorToUnit, getBuilderColor } from '@/app/shared/components/utils'
import { shortAddress } from '@/lib/utils'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Address, zeroAddress } from 'viem'
import AllocationBar from '../AllocationBar/AllocationBar'
import { AllocationBarProps, AllocationChangeData, AllocationItem } from '../AllocationBar/types'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

const UNALLOCATED_LABEL = 'Available backing' as const

function createUnallocatedItem(
  initialData: {
    balance: bigint
    cumulativeAllocation: bigint
  },
  cumulativeAllocation: bigint,
): {
  key: typeof zeroAddress
  label: typeof UNALLOCATED_LABEL
  initialValue: bigint
  value: bigint
  displayColor: 'var(--background-40)'
  isTemporary: boolean
  isEditable: true
} {
  const { balance, cumulativeAllocation: initialCumulativeAllocation } = initialData
  return {
    key: zeroAddress,
    label: UNALLOCATED_LABEL,
    initialValue: floorToUnit(balance - initialCumulativeAllocation),
    value: balance > cumulativeAllocation ? floorToUnit(balance - cumulativeAllocation) : 0n,
    displayColor: 'var(--background-40)',
    isTemporary: initialData.cumulativeAllocation != cumulativeAllocation,
    isEditable: true,
  }
}

const BuilderAllocationBar = ({ barOverrides }: { barOverrides?: Partial<AllocationBarProps> }) => {
  const isDesktop = useIsDesktop()
  const {
    initialState: {
      allocations: initialAllocations,
      backer: { balance: initialBalance, cumulativeAllocation: initialCumulativeAllocation },
    },
    state: {
      resetVersion,
      allocations,
      backer: { balance, cumulativeAllocation },
      getBuilder,
    },
    actions: { updateAllocation },
  } = useContext(AllocationsContext)

  // Local order state, includes zeroAddress for unallocated
  const [orderedKeys, setOrderedKeys] = useState<Address[]>([])

  useEffect(() => {
    setOrderedKeys([...(Object.keys(initialAllocations) as Address[]), zeroAddress])
  }, [resetVersion, initialAllocations])

  // Sync keys and add new keys to left of zeroAddress
  useEffect(() => {
    const allocationKeys = Object.keys(allocations) as Address[]

    if (orderedKeys.length === 0) {
      setOrderedKeys([...allocationKeys, zeroAddress])
      return
    }

    const unallocatedIndex = orderedKeys.indexOf(zeroAddress)
    const missingKeys = allocationKeys.filter(k => !orderedKeys.includes(k))

    if (missingKeys.length > 0) {
      setOrderedKeys(prev => {
        if (unallocatedIndex === -1) {
          return [...prev, ...missingKeys]
        }
        return [...prev.slice(0, unallocatedIndex), ...missingKeys, ...prev.slice(unallocatedIndex)]
      })
    }
  }, [allocations, initialAllocations, orderedKeys])

  const initialData = useMemo(() => {
    return {
      balance: initialBalance,
      cumulativeAllocation: initialCumulativeAllocation,
      allocations: initialAllocations,
    }
  }, [initialCumulativeAllocation, initialBalance, initialAllocations])

  // Build itemsData from orderedKeys including unallocated with its dynamic value
  const baseItems: AllocationItem[] = useMemo(() => {
    return orderedKeys
      .map((key: Address) => {
        if (key === zeroAddress) {
          return createUnallocatedItem(initialData, cumulativeAllocation)
        }

        const allocation = allocations[key]
        const builder = getBuilder(key)
        // TODO: Add a check to see if the builder is rewardable and
        // and change the segment to allow certain actions only (e.g.: reduce but not increase)

        const value = allocation || 0n
        const initialValue = initialData.allocations[key] || 0n

        return {
          key,
          label: builder?.builderName || shortAddress(key),
          value,
          initialValue,
          displayColor: getBuilderColor(key),
          isTemporary: initialData.allocations[key] !== allocation,
          isEditable: isBuilderRewardable(builder?.stateFlags),
        }
      })
      .filter(item => item !== null)
  }, [orderedKeys, allocations, cumulativeAllocation, initialData, getBuilder])

  // Local state for itemsData so bar updates on interactions
  const [itemsData, setItemsData] = useState<AllocationItem[]>(baseItems)

  // Sync itemsData with baseItems when baseItems change (e.g. from context updates)
  useEffect(() => {
    setItemsData(baseItems)
  }, [baseItems])

  // Handle allocation changes from AllocationBar
  const handleAllocationChange = useCallback(
    (change: AllocationChangeData) => {
      if (change.type === 'resize') {
        const { values: newValues, itemsData, increasedIndex, decreasedIndex } = change

        // Update allocations except for zeroAddress
        const changedItems = [itemsData[increasedIndex], itemsData[decreasedIndex]]
        changedItems.forEach(item => {
          const newValue = newValues[itemsData.indexOf(item)]
          if (item.key !== zeroAddress) {
            updateAllocation(item.key as Address, newValue)
          }
        })
      } else if (change.type === 'reorder') {
        setItemsData(change.itemsData)
        setOrderedKeys(change.itemsData.map(item => item.key))
      }
    },
    [updateAllocation],
  )

  if (balance === 0n) {
    return null
  }

  const isEmpty = cumulativeAllocation === 0n && Object.keys(allocations).length === 0
  return (
    <AllocationBar
      itemsData={itemsData}
      valueDisplay={{
        showPercent: isDesktop,
        format: {
          percentDecimals: 2,
        },
      }}
      isResizable={!isEmpty && isDesktop}
      isDraggable={!isEmpty && isDesktop}
      showLegend={isDesktop}
      height={isEmpty || !isDesktop ? '1rem' : undefined}
      onChange={handleAllocationChange}
      // we want the component to have the same height
      {...barOverrides}
    />
  )
}

export { BuilderAllocationBar }
