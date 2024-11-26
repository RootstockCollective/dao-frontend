import { Dispatch, SetStateAction } from 'react'
import { Allocations, AllocationsActions, Backer, InitialState, Selections } from './AllocationsContext'
import { Address } from 'viem'
export const createActions = (
  setSelections: Dispatch<SetStateAction<Selections>>,
  setAllocations: Dispatch<SetStateAction<Allocations>>,
  setBacker: Dispatch<SetStateAction<Backer>>,
  initialState: InitialState,
): AllocationsActions => ({
  toggleSelectedBuilder: (builderAddress: Address) => {
    setSelections(prevSelections => {
      console.log(`😈 ---------------------------------------------------------------------😈`)
      console.log(`😈 ~ file: allocationsActions.tsx:59 ~ prevSelections:`, prevSelections)
      console.log(`😈 ~ file: allocationsActions.tsx:59 ~ builderAddress:`, builderAddress)
      console.log(
        `😈 ~ file: allocationsActions.tsx:59 ~ prevSelections[builderAddress]:`,
        prevSelections[builderAddress],
      )
      console.log(`😈 ---------------------------------------------------------------------😈`)

      return {
        ...prevSelections,
        [builderAddress]: !prevSelections[builderAddress],
      }
    })
  },
  updateAllocation: (builderAddress: Address, value: bigint) => {
    setAllocations(prevAllocations => {
      const newAllocations = { ...prevAllocations, [builderAddress]: value }
      setBacker(prevBacker => ({
        ...prevBacker,
        cumulativeAllocation:
          prevBacker.cumulativeAllocation + value - (prevAllocations[builderAddress] ?? BigInt(0)),
      }))
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
    setAllocations(initialState.allocations)
    setBacker(initialState.backer)
  },
})
