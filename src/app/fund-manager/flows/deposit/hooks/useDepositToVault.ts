import { useMemo } from 'react'

import { rbtcVault } from '@/lib/contracts'
import { useContractWrite } from '@/shared/hooks/useContractWrite'

/**
 * Fund manager CTA: move capital into RBTCAsyncVault (deployed capital deposit).
 * Native: `moveCapitalInNative()` with `value`; WRBTC: `moveCapitalIn(assets)` after allowance.
 */
export const useDepositToVault = (amountWei: bigint, isNative: boolean) => {
  const config = useMemo(
    () =>
      isNative
        ? {
            ...rbtcVault,
            functionName: 'moveCapitalInNative' as const,
            args: [] as const,
            value: amountWei,
          }
        : {
            ...rbtcVault,
            functionName: 'moveCapitalIn' as const,
            args: [amountWei] as readonly [bigint],
          },
    [amountWei, isNative],
  )

  return useContractWrite(config)
}
