import { Address } from 'viem'
import { Allocations, Backer } from './AllocationsContext'
import { Builder } from '../../types'

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

export type GetVoteAllocationsParams = {
  initialAllocations: Allocations
  currentAllocations: Allocations
  getBuilder: (address: Address) => Builder | null
}
export const getVoteAllocations = ({
  initialAllocations,
  currentAllocations,
  getBuilder,
}: GetVoteAllocationsParams) => {
  return Object.entries(currentAllocations).reduce<[Address[], bigint[]]>(
    (acc, [key, value]) => {
      const builderAddress = key as Address
      const gauge = getBuilder(builderAddress)?.gauge
      if (gauge && value !== initialAllocations[builderAddress]) {
        acc[0] = [...acc[0], gauge]
        acc[1] = [...acc[1], value]
      }
      return acc
    },
    [[], []],
  )
}
