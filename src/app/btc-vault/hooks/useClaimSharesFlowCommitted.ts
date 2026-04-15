'use client'

import { useCallback, useState } from 'react'

/**
 * Holds claim/redeem CTA in the in-progress branch for the full `executeTxFlow` call.
 * Wagmi can briefly clear `isPending` on the write hook before receipt `isPending` is true;
 * this covers that gap so the button does not flash back to clickable mid-flow.
 */
export function useClaimSharesFlowCommitted() {
  const [isFlowCommitted, setIsFlowCommitted] = useState(false)

  const withFlowCommitUi = useCallback(async (run: () => Promise<unknown>) => {
    setIsFlowCommitted(true)
    try {
      await run()
    } finally {
      setIsFlowCommitted(false)
    }
  }, [])

  return { isFlowCommitted, withFlowCommitUi }
}
