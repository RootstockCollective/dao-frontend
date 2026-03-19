'use client'

import { type Address } from 'viem'

import { RootcampABI } from '@/lib/abis/RootcampABI'
import { ROOTCAMP_NFT_ADDRESS } from '@/lib/constants'

import { useNftWhitelist } from '../shared/useNftWhitelist'

/**
 * Custom React hook for interacting with the Rootcamp NFT contract.
 * Fetches minters, guards, and role info, and enriches minter data with RNS domains.
 */
function useRcNft() {
  // Always call the hook in the same order (React Rules of Hooks).
  // Use a fallback address when the real one is undefined to avoid breaking the hook.
  const result = useNftWhitelist({
    address: ROOTCAMP_NFT_ADDRESS || ('0x0000000000000000000000000000000000000000' as Address),
    // SAFETY: RootcampABI is `readonly` const tuple which doesn't satisfy the generic `Abi` constraint;
    // the runtime value is correct — this is a TypeScript structural limitation with deep const arrays.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: RootcampABI as any,
    toastIdPrefix: 'rc-nft',
  })

  // Return fallback when contract not configured (after hook is called).
  if (!ROOTCAMP_NFT_ADDRESS) {
    return {
      guards: [],
      minters: [],
      hasGuardRole: false,
      loading: false,
      revokeMinterRole: () => {},
      whitelistMinters: () => {},
      pending: false,
      reloadMinters: () => {},
    }
  }

  return result
}

export { useRcNft }
