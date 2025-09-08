import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { floorToUnit, getBuilderColor } from '@/app/shared/components/utils'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Address, zeroAddress } from 'viem'
import AllocationBar from '../AllocationBar/AllocationBar'
import { AllocationBarProps, AllocationChangeData, AllocationItem } from '../AllocationBar/types'

const UNALLOCATED_LABEL = 'Available backing'

const BuilderAllocationBar = ({ barOverrides }: { barOverrides?: Partial<AllocationBarProps> }) => {
  const {
    initialState: { allocations: initialAllocations },
    state: {
      resetVersion,
      allocations,
      backer: { balance, cumulativeAllocation },
      getBuilder,
    },
    actions: { updateAllocation },
  } = useContext(AllocationsContext)

  // Local order state, includes zeroAddress for unallocated segment
  const [orderedKeys, setOrderedKeys] = useState<string[]>([zeroAddress])

  useEffect(() => {
    setOrderedKeys([...Object.keys(initialAllocations), zeroAddress])
  }, [resetVersion, initialAllocations])

  // Sync keys and add new keys to left of unallocated (zeroAddress)
  useEffect(() => {
    const allocationKeys = Object.keys(allocations)

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

  // Calculate unallocated amount
  const unallocated = useMemo(() => {
    return balance > cumulativeAllocation ? floorToUnit(balance - cumulativeAllocation) : 0n
  }, [balance, cumulativeAllocation])

  // Build itemsData from orderedKeys including unallocated with its dynamic value
  const baseItems: AllocationItem[] = useMemo(() => {
    return orderedKeys
      .map(key => {
        if (key === zeroAddress) {
          return {
            key: zeroAddress,
            label: UNALLOCATED_LABEL,
            value: unallocated,
            displayColor: 'var(--background-40)',
          }
        }
        const addressKey = key as Address

        const allocation = allocations[addressKey]
        const builder = getBuilder(addressKey)
        // TODO: Add a check to see if the builder is rewardable and
        // and change the segment to allow certain actions only (e.g.: reduce but not increase)

        const value = allocation || 0n
        const initialValue = initialAllocations[addressKey] || 0n

        return {
          key,
          label: builder?.builderName || key,
          value,
          initialValue,
          displayColor: getBuilderColor(addressKey),
          isTemporary: initialAllocations[addressKey] !== allocation,
        }
      })
      .filter(item => item !== null)
  }, [orderedKeys, allocations, unallocated, initialAllocations, getBuilder])

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

        // Update allocations except for unallocated (zeroAddress)
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

  const isEmpty = cumulativeAllocation === 0n && Object.keys(allocations).length === 0

  if (balance === 0n && isEmpty) {
    return (
      <AllocationBar
        itemsData={[
          {
            key: zeroAddress,
            label: UNALLOCATED_LABEL,
            value: 1n,
            initialValue: 1n,
            displayColor: 'var(--background-60)',
            isTemporary: true,
          },
        ]}
        valueDisplay={{
          showPercent: false,
        }}
        isResizable={false}
        isDraggable={false}
        height="1rem"
        onChange={() => {}}
        className="min-h-52"
        {...barOverrides}
      />
    )
  }

  return (
    <AllocationBar
      itemsData={itemsData}
      valueDisplay={{
        showPercent: true,
        format: {
          percentDecimals: 2,
        },
      }}
      isResizable={!isEmpty}
      isDraggable={!isEmpty}
      height={isEmpty ? '1rem' : undefined}
      onChange={handleAllocationChange}
      // we want the component to have the same height
      className={`${isEmpty ? 'min-h-52' : ''}`}
      {...barOverrides}
    />
  )
}

export { BuilderAllocationBar }
