import { useContext, useMemo } from 'react'

import { Allocations, AllocationsContext } from '@/app/collective-rewards/allocations/context'

import { getBackingBoostHint } from '../abiBoost.utils'
import { useIsAbiBoostEnabled } from './useAbiBoost'

const sumAllocations = (allocations: Allocations): bigint =>
  Object.values(allocations).reduce((total, allocation) => total + allocation, 0n)

export interface BackingBoostChange {
  /** On-chain backing, in wei: the same total the header and the boost card read. */
  current: bigint
  /** That total with the unsaved edits applied, in wei. */
  next: bigint
}

/**
 * The backing the boost is measured on, before and after the edits in progress.
 *
 * Edits only reach the Builders the page lists, so they are applied as a delta on top of the
 * on-chain total instead of summing the listed Builders: a backing held on a Builder the list
 * doesn't carry still counts, exactly as it does for the badge and the card.
 */
export const useBackingBoostChange = (): BackingBoostChange => {
  const {
    state: { allocations },
    initialState: {
      allocations: initialAllocations,
      backer: { amountToAllocate: onchainBacking },
    },
  } = useContext(AllocationsContext)

  return useMemo(
    () => ({
      current: onchainBacking,
      next: onchainBacking + sumAllocations(allocations) - sumAllocations(initialAllocations),
    }),
    [onchainBacking, allocations, initialAllocations],
  )
}

/**
 * Whether the backing earns the boost: saved at or above the minimum, or about to be once the edit
 * in progress is saved. ABI figures then show the boosted rate instead of the plain one.
 */
export const useIsBackingBoosted = (): boolean => {
  const isAbiBoostEnabled = useIsAbiBoostEnabled()
  const { current, next } = useBackingBoostChange()
  const hint = getBackingBoostHint(current, next)
  return isAbiBoostEnabled && (hint?.kind === 'active' || hint?.kind === 'willActivate')
}
