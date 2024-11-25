import { Dispatch, SetStateAction } from 'react'
import { Allocations, AllocationsActions, Backer, InitialState } from './AllocationsContext'
export const createActions = (
  setSelections: Dispatch<SetStateAction<number[]>>,
  setAllocations: Dispatch<SetStateAction<Record<number, bigint>>>,
  setBacker: Dispatch<SetStateAction<Backer>>,
  initialState: InitialState,
): AllocationsActions => ({
  toggleSelectedBuilder: (builderIndex: number) => {
    setSelections(prevSelections =>
      prevSelections.includes(builderIndex)
        ? prevSelections.filter(index => index !== builderIndex)
        : [...prevSelections, builderIndex],
    )
  },
  updateAllocation: (builderIndex: number, value: bigint) => {
    setAllocations(prevAllocations => {
      const newAllocations = { ...prevAllocations, [builderIndex]: value }
      setBacker(prevBacker => ({
        ...prevBacker,
        cumulativeAllocation:
          prevBacker.cumulativeAllocation + value - (prevAllocations[builderIndex] ?? BigInt(0)),
      }))
      return newAllocations
    })
  },
  updateAllocations: (values: bigint[]) => {
    const [newAllocations, newCumulativeAllocation] = values.reduce(
      (acc, value, index) => {
        acc[0][index] = value
        acc[1] += value
        return acc
      },
      [{} as Allocations, BigInt(0)],
    )
    setAllocations(newAllocations)
    setBacker(prevBacker => ({
      ...prevBacker,
      cumulativeAllocation: newCumulativeAllocation,
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
