import { useMemo } from 'react'

import { syntheticYield } from '@/lib/contracts'
import { useContractWrite } from '@/shared/hooks/useContractWrite'

/**
 * Fund manager CTA: `SyntheticYield.fund(uint256)` (WRBTC) or `fundNative()` (payable, native RBTC).
 */
export const useSyntheticYieldTopUp = (amountWei: bigint, isNative: boolean) => {
  const config = useMemo(
    () =>
      isNative
        ? {
            ...syntheticYield,
            functionName: 'fundNative' as const,
            args: [] as const,
            value: amountWei,
          }
        : {
            ...syntheticYield,
            functionName: 'fund' as const,
            args: [amountWei] as const,
          },
    [amountWei, isNative],
  )
  return useContractWrite(config)
}
