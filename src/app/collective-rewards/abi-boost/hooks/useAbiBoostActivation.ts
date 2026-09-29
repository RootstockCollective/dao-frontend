import { useContext, useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'

import { ABI_BOOST } from '../abiBoost.utils'
import { useBackingBoostChange } from './useBackingBoostChange'

interface SaveAttempt {
  /** On-chain backing when the save started. */
  before: bigint
  /** The backing the save sets. */
  target: bigint
}

/**
 * Tells when a backing save takes the on-chain backing over the minimum, i.e. when the boost has
 * just switched on because of something the user did on this page.
 *
 * Each save records where the backing stood and where it is going. Only the on-chain total
 * reaching exactly that target counts as the save landing: a rejected or reverted save never gets
 * there, and a page load, a refetch or another wallet can't stand in for it.
 */
export const useAbiBoostActivation = (minBacking: bigint = ABI_BOOST.minBackingWei) => {
  const { address } = useAccount()
  const {
    state: { isAllocationTxPending },
  } = useContext(AllocationsContext)
  const { current, next } = useBackingBoostChange()
  const saveAttempt = useRef<SaveAttempt | null>(null)
  const wasPending = useRef(false)
  const [hasActivated, setHasActivated] = useState(false)

  // A new attempt replaces the previous one: only the latest save can still land
  useEffect(() => {
    if (isAllocationTxPending && !wasPending.current) {
      saveAttempt.current = { before: current, target: next }
    }
    wasPending.current = isAllocationTxPending
  }, [isAllocationTxPending, current, next])

  // Another wallet can't complete this one's save
  useEffect(() => {
    saveAttempt.current = null
  }, [address])

  useEffect(() => {
    const attempt = saveAttempt.current
    if (!attempt || current !== attempt.target) return

    saveAttempt.current = null
    if (attempt.before < minBacking && attempt.target >= minBacking) {
      setHasActivated(true)
    }
  }, [current, minBacking])

  return { hasActivated, dismiss: () => setHasActivated(false) }
}
