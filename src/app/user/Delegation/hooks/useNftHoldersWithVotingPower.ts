import { useState, useEffect } from 'react'
import { getCachedNftHoldersShepards } from '@/app/user/Delegation/server/fetchNftHoldersWithVotingPower'

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
    getCachedNftHoldersShepards().then(holders => setNftHolders(holders))
  }, [])

  return nftHolders
}
