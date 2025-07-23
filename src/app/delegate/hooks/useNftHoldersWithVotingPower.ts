import { useState, useEffect } from 'react'
import { getCachedNftHoldersShepherds } from '@/app/delegate/server/fetchNftHoldersWithVotingPower'

export interface NftHolder {
  address: string
  RNS: string | null
  votingPower?: number
}

/**
 * Fetches NFT holders, resolves RNS domains, and retrieves their voting power from the contract.
 * Returns a list of enriched NFT holders with voting power.
 */
export function useNftHoldersWithVotingPower() {
  const [nftHolders, setNftHolders] = useState<NftHolder[]>([])

  useEffect(() => {
    getCachedNftHoldersShepherds().then(holders => setNftHolders(holders))
  }, [])

  return nftHolders
}
