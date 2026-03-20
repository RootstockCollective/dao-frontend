import { useMemo } from 'react'

import { buffer } from '@/lib/contracts'
import { useContractWrite } from '@/shared/hooks/useContractWrite'

/**
 * CTA-specific hook for the Top Up Buffer flow.
 * Provides two write functions:
 * - `onInject(amountWei)`: for WrBTC (ERC-20) — calls `buffer.inject(uint256)`
 * - `onInjectNative(amountWei)`: for rBTC (native) — calls `buffer.injectNative()` with value
 */
export const useTopUpBuffer = (amountWei: bigint, isNative: boolean) => {
  const erc20Config = useMemo(
    () => ({
      ...buffer,
      functionName: 'inject' as const,
      args: [amountWei] as const,
    }),
    [amountWei],
  )
  const nativeConfig = useMemo(
    () => ({
      ...buffer,
      functionName: 'injectNative' as const,
      args: [] as const,
      value: amountWei,
    }),
    [amountWei],
  )
  const config = isNative ? nativeConfig : erc20Config
  return useContractWrite(config)
}
