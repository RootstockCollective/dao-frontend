'use client'

import { RootlingsS1ABI } from '@/lib/abis/RootlingsS1'
import { ROOTLINGS_S1_NFT_ADDRESS } from '@/lib/constants'

import { useNftWhitelist } from '../shared/useNftWhitelist'

/**
 * Custom React hook for interacting with the Rootlings Series 1 NFT contract.
 * Fetches minters, guards, and role info, and enriches minter data with RNS domains.
 */
function useRootlingsS1() {
  return useNftWhitelist({
    address: ROOTLINGS_S1_NFT_ADDRESS,
    // SAFETY: RootlingsS1ABI is `readonly` const tuple which doesn't satisfy the generic `Abi` constraint;
    // the runtime value is correct — this is a TypeScript structural limitation with deep const arrays.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: RootlingsS1ABI as any,
    toastIdPrefix: 'rootlings',
  })
}

export { useRootlingsS1 }
