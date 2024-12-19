import { Address } from 'viem'
import { Allocations, Backer } from './AllocationsContext'

export type ValidateAllocationsStateParams = {
  backer: Pick<Backer, 'amountToAllocate' | 'balance' | 'cumulativeAllocation'>
  initialAllocations: Allocations
  currentAllocations: Allocations
  totalOnchainAllocation: bigint
}
export const validateAllocationsState = ({
  backer,
  initialAllocations,
  currentAllocations,
  totalOnchainAllocation = 0n,
}: ValidateAllocationsStateParams): boolean => {
  const { balance, cumulativeAllocation, amountToAllocate } = backer

  if (cumulativeAllocation > balance || amountToAllocate > balance) {
    return false
  }

  if (totalOnchainAllocation === cumulativeAllocation) {
    return Object.entries(initialAllocations).some(([builder, allocation]) => {
      return allocation !== currentAllocations[builder as Address]
    })
  }

  return true
}
