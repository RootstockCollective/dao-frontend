'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Hash } from 'viem'
import { executeTxFlow } from './executeTxFlow'

type ExecuteTxFlowArgs = Parameters<typeof executeTxFlow>[0]
type ExecuteTxFlowResult = Promise<Hash | undefined>

/**
 * React-friendly wrapper around `executeTxFlow`.
 *
 * Why: wagmi write `isPending` typically ends after tx submission (hash),
 * while `executeTxFlow` waits for the on-chain receipt. This hook exposes a
 * stable `isExecuting` flag that stays true for the full lifecycle.
 */
export const useExecuteTxFlow = () => {
  const [pendingCount, setPendingCount] = useState(0)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const execute = useCallback(async (args: ExecuteTxFlowArgs): ExecuteTxFlowResult => {
    // Support concurrent calls without incorrectly flipping to false early.
    setPendingCount(c => c + 1)
    try {
      return await executeTxFlow(args)
    } finally {
      if (!isMountedRef.current) return
      setPendingCount(c => Math.max(0, c - 1))
    }
  }, [])

  const isExecuting = useMemo(() => pendingCount > 0, [pendingCount])

  return { execute, isExecuting }
}
