import { useContext, useMemo } from 'react'

import { Allocations, AllocationsContext } from '@/app/collective-rewards/allocations/context'

import { getBackingBoostHint } from '../abiBoost.utils'
import { useIsAbiBoostEnabled } from './useAbiBoost'

const sumAllocations = (allocations: Allocations): bigint =>
  Object.values(allocations).reduce((total, allocation) => total + allocation, 0n)

export interface BackingBoostChange {
  current: bigint
  next: bigint
}

export const useBackingBoostChange = (): BackingBoostChange => {
  const {
    state: { allocations },
    initialState: {
      allocations: initialAllocations,
      backer: { amountToAllocate: onchainBacking },
    },
  } = useContext(AllocationsContext)

  // Edits only touch listed Builders, so they apply as a delta on the on-chain total, which counts all of them
  return useMemo(
    () => ({
      current: onchainBacking,
      next: onchainBacking + sumAllocations(allocations) - sumAllocations(initialAllocations),
    }),
    [onchainBacking, allocations, initialAllocations],
  )
}

export const useIsBackingBoosted = (): boolean => {
  const isAbiBoostEnabled = useIsAbiBoostEnabled()
  const { current, next } = useBackingBoostChange()
  const hint = getBackingBoostHint(current, next)
  return isAbiBoostEnabled && (hint?.kind === 'active' || hint?.kind === 'willActivate')
}
