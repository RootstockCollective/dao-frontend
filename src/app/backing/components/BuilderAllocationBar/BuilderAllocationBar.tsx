import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { useContext, useMemo, useCallback, useEffect, useState } from 'react'
import { Address, formatEther, parseEther } from 'viem'
import { AllocationChangeData, AllocationItem } from '../AllocationBar/types'
import AllocationBar from '../AllocationBar/AllocationBar'
import { floorToUnit } from '../utils'

const BuilderAllocationBar = () => {
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

  // Local order state, includes 'unallocated'
  const [orderedKeys, setOrderedKeys] = useState<string[]>([])

  useEffect(() => {
    setOrderedKeys([...Object.keys(initialAllocations), 'unallocated'])
  }, [resetVersion, initialAllocations])

  // Sync keys and add new keys to left of 'unallocated'
  useEffect(() => {
    const allocationKeys = Object.keys(allocations)

    if (orderedKeys.length === 0) {
      setOrderedKeys([...allocationKeys, 'unallocated'])
      return
    }

    const unallocatedIndex = orderedKeys.indexOf('unallocated')
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
    return orderedKeys.map(key => {
      if (key === 'unallocated') {
        return {
          key: 'unallocated',
          label: 'available backing',
          value: Number(formatEther(unallocated)),
          displayColor: '#25211E',
        }
      }

      const allocation = allocations[key as Address]
      const builder = getBuilder(key as Address)
      const value = allocation ? Number(formatEther(allocation)) : 0

      return {
        key,
        label: builder?.builderName || key,
        value,
        displayColor: `#${key.slice(-6).toUpperCase()}`,
        isTemporary: initialAllocations[key as Address] !== allocation,
      }
    })
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

        // Update allocations except for 'unallocated'
        const changedItems = [itemsData[increasedIndex], itemsData[decreasedIndex]]
        changedItems.forEach(item => {
          if (item.key !== 'unallocated') {
            updateAllocation(item.key as Address, parseEther(newValues[itemsData.indexOf(item)].toString()))
          }
        })
      } else if (change.type === 'reorder') {
        setItemsData(change.itemsData)
        setOrderedKeys(change.itemsData.map(item => item.key))
      }
    },
    [updateAllocation],
  )

  const isEmpty = cumulativeAllocation === 0n

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
    />
  )
}

export { BuilderAllocationBar }
