import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { useContext, useMemo, useCallback } from 'react'
import { Address, formatEther, parseEther } from 'viem'
import { AllocationChangeData, AllocationItem } from '../AllocationBar/types'
import AllocationBar from '../AllocationBar/AllocationBar'
import { floorToUnit } from '../utils'

const handleAllocationChange = (
  changeInfo: AllocationChangeData,
  updateAllocation: (address: Address, amount: bigint) => void,
) => {
  const { values, itemsData, increasedIndex, decreasedIndex } = changeInfo
  const increasedItem = itemsData[increasedIndex]
  const decreasedItem = itemsData[decreasedIndex]

  // Only update allocation for actual builder addresses, not for 'unallocated'
  if (increasedItem.key !== 'unallocated') {
    updateAllocation(increasedItem.key as Address, parseEther(values[increasedIndex].toString()))
  }
  if (decreasedItem.key !== 'unallocated') {
    updateAllocation(decreasedItem.key as Address, parseEther(values[decreasedIndex].toString()))
  }
}

const BuilderAllocationBar = () => {
  const {
    initialState: { allocations: initialAllocations },
    state: {
      allocations,
      backer: { balance, cumulativeAllocation },
      getBuilder,
    },
    actions: { updateAllocation },
  } = useContext(AllocationsContext)

  const allocationItems = useMemo(() => {
    if (cumulativeAllocation === 0n) {
      return [
        {
          key: 'unallocated',
          label: 'available funds',
          value: 100,
          displayColor: '#25211E',
        },
      ]
    }

    const unallocatedAmount = floorToUnit(balance - cumulativeAllocation)

    const builderItems: AllocationItem[] = Object.entries(allocations).map(([address, allocation]) => {
      const builder = getBuilder(address as Address)
      const displayColor = `#${address.slice(-6).toUpperCase()}`
      const value = Number(formatEther(allocation))
      const isTemporary = initialAllocations[address as Address] !== allocation

      return {
        key: address,
        label: builder?.builderName || address,
        value,
        displayColor,
        isTemporary,
      }
    })

    builderItems.push({
      key: 'unallocated',
      label: 'available funds',
      value: Number(formatEther(unallocatedAmount)),
      displayColor: '#25211E',
    })

    return builderItems
  }, [allocations, initialAllocations, balance, cumulativeAllocation, getBuilder])

  const isEmpty = cumulativeAllocation === 0n

  return (
    <AllocationBar
      initialItemsData={allocationItems}
      valueDisplay={{
        showPercent: true,
        format: {
          percentDecimals: 2,
        },
      }}
      isResizable={!isEmpty}
      isDraggable={!isEmpty}
      height={isEmpty ? '1rem' : undefined}
      onChange={changeInfo => handleAllocationChange(changeInfo, updateAllocation)}
    />
  )
}

export { BuilderAllocationBar }
