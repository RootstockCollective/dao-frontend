'use client'

import { RootcampABI } from '@/lib/abis/RootcampABI'
import { ROOTCAMP_NFT_ADDRESS } from '@/lib/constants'

import { useNftWhitelist } from '../shared/useNftWhitelist'

/**
 * Custom React hook for interacting with the Rootcamp NFT contract.
 * Fetches minters, guards, and role info, and enriches minter data with RNS domains.
 */
function useRcNft() {
  return useNftWhitelist({
    address: ROOTCAMP_NFT_ADDRESS,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: RootcampABI as any,
    toastIdPrefix: 'rc-nft',
  })
}

export { useRcNft }
