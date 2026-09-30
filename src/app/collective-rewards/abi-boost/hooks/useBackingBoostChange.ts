import { useContext, useMemo } from 'react'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'

import { ABI_BOOST } from '../abiBoost.utils'
import { useIsAbiBoostEnabled } from './useAbiBoost'

export interface BackingBoostChange {
  current: bigint
  next: bigint
}

export const useBackingBoostChange = (): BackingBoostChange => {
  const {
    state: {
      backer: { cumulativeAllocation: editedTotal },
    },
    initialState: {
      backer: { amountToAllocate: onchainBacking, cumulativeAllocation: savedTotal },
    },
  } = useContext(AllocationsContext)

  // Edits only touch listed Builders, so they apply as a delta on the on-chain total, which counts all of them
  return useMemo(
    () => ({ current: onchainBacking, next: onchainBacking + editedTotal - savedTotal }),
    [onchainBacking, editedTotal, savedTotal],
  )
}

// Saved backing only: an edit changes nothing until it is saved, so the rate shown must not move with it
export const useIsBackingBoosted = (minBacking: bigint = ABI_BOOST.minBackingWei): boolean => {
  const isAbiBoostEnabled = useIsAbiBoostEnabled()
  const { current } = useBackingBoostChange()
  return isAbiBoostEnabled && current >= minBacking
}
