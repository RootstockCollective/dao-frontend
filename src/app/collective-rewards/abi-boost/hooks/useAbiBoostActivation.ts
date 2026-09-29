import { useContext, useEffect, useRef, useState } from 'react'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'

import { ABI_BOOST } from '../abiBoost.utils'

/**
 * Tells when a backing save takes the on-chain backing over the minimum, i.e. when the boost has
 * just switched on because of something the user did on this page.
 *
 * The on-chain total is snapshotted when a save starts, and compared once the refreshed total
 * arrives: a page load, or a total that was already boosted, never counts as an activation.
 */
export const useAbiBoostActivation = (minBacking: bigint = ABI_BOOST.minBackingWei) => {
  const {
    state: { isAllocationTxPending },
    initialState: {
      backer: { cumulativeAllocation: onchainBacking },
    },
  } = useContext(AllocationsContext)
  const backingBeforeSave = useRef<bigint | null>(null)
  const [hasActivated, setHasActivated] = useState(false)

  useEffect(() => {
    if (isAllocationTxPending && backingBeforeSave.current === null) {
      backingBeforeSave.current = onchainBacking
    }
  }, [isAllocationTxPending, onchainBacking])

  useEffect(() => {
    const before = backingBeforeSave.current
    // Still saving, nothing saved yet, or the refreshed total hasn't landed
    if (isAllocationTxPending || before === null || onchainBacking === before) return

    backingBeforeSave.current = null
    if (before < minBacking && onchainBacking >= minBacking) {
      setHasActivated(true)
    }
  }, [isAllocationTxPending, onchainBacking, minBacking])

  return { hasActivated, dismiss: () => setHasActivated(false) }
}
