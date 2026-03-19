import { useCallback } from 'react'
import { Hash } from 'viem'
import { useWriteContract } from 'wagmi'

import { buffer } from '@/lib/contracts'

/**
 * CTA-specific hook for the Top Up Buffer flow.
 * Provides two write functions:
 * - `onInject(amount)`: for WrBTC (ERC-20) — calls `buffer.inject(uint256)`
 * - `onInjectNative(amount)`: for rBTC (native) — calls `buffer.injectNative()` with value
 */
export const useTopUpBuffer = () => {
  const { writeContractAsync } = useWriteContract()

  const onInject = useCallback(
    (amount: bigint): Promise<Hash> => {
      return writeContractAsync({
        ...buffer,
        functionName: 'inject',
        args: [amount],
      })
    },
    [writeContractAsync],
  )

  const onInjectNative = useCallback(
    (amount: bigint) => {
      return writeContractAsync({
        ...buffer,
        functionName: 'injectNative',
        value: amount,
      })
    },
    [writeContractAsync],
  )

  return { onInject, onInjectNative }
}
