import { useMemo } from 'react'
import { Address } from 'viem'

import { rbtcVault } from '@/lib/contracts'
import { useContractWrite } from '@/shared/hooks/useContractWrite'

/**
 * Fund manager CTA: move capital out of RBTCAsyncVault to a destination address.
 * Native: `moveCapitalOutNative(assets, destination)`; WRBTC: `moveCapitalOut(assets, destination)`.
 * Both are non-payable — the vault sends its own assets to the destination.
 */
export const useTransferToManager = (amountWei: bigint, isNative: boolean, destination: Address) => {
  const config = useMemo(
    () =>
      isNative
        ? {
            ...rbtcVault,
            functionName: 'moveCapitalOutNative' as const,
            args: [amountWei, destination] as const,
          }
        : {
            ...rbtcVault,
            functionName: 'moveCapitalOut' as const,
            args: [amountWei, destination] as const,
          },
    [amountWei, isNative, destination],
  )
  return useContractWrite(config)
}
