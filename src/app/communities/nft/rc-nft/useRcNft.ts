'use client'

import { RootcampABI } from '@/lib/abis/RootcampABI'
import { ROOTCAMP_NFT_ADDRESS } from '@/lib/constants'

import { useNftWhitelist } from '../shared/useNftWhitelist'

/**
 * Custom React hook for interacting with the Rootcamp NFT contract.
 * Fetches minters, guards, and role info, and enriches minter data with RNS domains.
 */
function useRcNft() {
  if (!ROOTCAMP_NFT_ADDRESS) {
    // Contract address not configured for this environment
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

  return useNftWhitelist({
    address: ROOTCAMP_NFT_ADDRESS,
    // SAFETY: RootcampABI is `readonly` const tuple which doesn't satisfy the generic `Abi` constraint;
    // the runtime value is correct — this is a TypeScript structural limitation with deep const arrays.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: RootcampABI as any,
    toastIdPrefix: 'rc-nft',
  })
}

export { useRcNft }
