import { Dispatch, SetStateAction } from 'react'
import { Allocations, AllocationsActions, Backer, InitialState, Selections } from './AllocationsContext'
import { Address } from 'viem'
export const createActions = (
  setResetVersion: Dispatch<SetStateAction<number>>,
  setSelections: Dispatch<SetStateAction<Selections>>,
  setAllocations: Dispatch<SetStateAction<Allocations>>,
  setBacker: Dispatch<SetStateAction<Backer>>,
  initialState: InitialState,
): AllocationsActions => ({
  toggleSelectedBuilder: (builderAddress: Address) => {
    setSelections(prevSelections => ({
      ...prevSelections,
      [builderAddress]: !prevSelections[builderAddress],
    }))
  },
  updateAllocation: (builderAddress: Address, value: bigint) => {
    setAllocations(prevAllocations => {
      const newAllocations: Allocations = { ...prevAllocations, [builderAddress]: value }
      const newCumulativeAllocation = Object.values(newAllocations).reduce<bigint>(
        (acc, value) => acc + value,
        0n,
      )
      setBacker(prevBacker => {
        const ret = {
          ...prevBacker,
          cumulativeAllocation: newCumulativeAllocation,
        }
        return ret
      })
      return newAllocations
    })
  },
  updateAllocations: (newAllocation: Allocations) => {
    const [cumulativeAllocation, allocationCount] = Object.values(newAllocation).reduce(
      (acc, value) => {
        acc[0] += value ?? BigInt(0) // cumulative allocation
        acc[1] += 1 // allocations count

        return acc
      },
      [BigInt(0), 0],
    )

    setAllocations(newAllocation)
    setBacker(prevBacker => ({
      ...prevBacker,
      cumulativeAllocation,
      allocationCount,
    }))
  },
  updateAmountToAllocate: (value: bigint) => {
    setBacker(prevBacker => ({
      ...prevBacker,
      amountToAllocate: value,
    }))
  },
  resetAllocations: () => {
    setResetVersion(prev => prev + 1)
    setAllocations(initialState.allocations)
    setBacker(initialState.backer)
  },
})
