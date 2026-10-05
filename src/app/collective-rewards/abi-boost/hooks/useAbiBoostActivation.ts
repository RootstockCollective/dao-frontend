import { useContext, useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'

import { ABI_BOOST } from '../abiBoost.utils'
import { useBackingBoostChange } from './useBackingBoostChange'

interface SaveAttempt {
  before: bigint
  target: bigint
}

export const useAbiBoostActivation = (minBacking: bigint = ABI_BOOST.minBackingWei) => {
  const { address } = useAccount()
  const {
    state: { isAllocationTxPending },
  } = useContext(AllocationsContext)
  const { current, next } = useBackingBoostChange()
  const saveAttempt = useRef<SaveAttempt | null>(null)
  const wasPending = useRef(false)
  const [hasActivated, setHasActivated] = useState(false)

  useEffect(() => {
    if (isAllocationTxPending && !wasPending.current) {
      saveAttempt.current = { before: current, target: next }
    }
    wasPending.current = isAllocationTxPending
  }, [isAllocationTxPending, current, next])

  useEffect(() => {
    saveAttempt.current = null
  }, [address])

  // Only a save that lands brings the on-chain total to its target; a rejected or reverted one never does
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
