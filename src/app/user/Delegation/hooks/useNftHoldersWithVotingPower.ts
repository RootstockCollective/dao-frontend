import { useState, useEffect, useCallback } from 'react'
import { getCachedNftHoldersShepherds } from '@/app/user/Delegation/server/fetchNftHoldersWithVotingPower'
import { ContributorApiResponse } from '@/app/proposals/shared/types'

interface NftHolder {
  address: string
  RNS: string | null
  delegatedSince: string
  totalVotes: number
  delegators: number
  votingPower?: number
  imageIpfs?: string | null
}

/**
 * Fetches NFT holders, resolves RNS domains, and retrieves their voting power from the contract.
 * Returns a list of enriched NFT holders with voting power.
 */
export function useNftHoldersWithVotingPower() {
  const [nftHolders, setNftHolders] = useState<NftHolder[]>([])

  const load = useCallback(async () => {
    const [contributors, cachedHolders] = await Promise.all([
      fetchContributorsFromAPI(),
      getCachedNftHoldersShepherds(),
    ])

    const cachedMap = new Map(cachedHolders.map(h => [h.address.toLowerCase(), h]))

    const merged: NftHolder[] = contributors
      .map(c => {
        const cached = cachedMap.get(c.id.toLowerCase())
        return {
          address: c.id,
          RNS: cached?.RNS ?? null,
          delegatedSince: c.createdAt,
          totalVotes: c.votes,
          delegators: c.delegators,
          imageIpfs: cached?.imageIpfs,
          votingPower: cached?.votingPower,
        }
      })
      .filter(c => c.votingPower !== undefined && c.votingPower > 0)

    setNftHolders(merged)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { nftHolders, refetch: load }
}

export async function fetchContributorsFromAPI(): Promise<ContributorApiResponse[]> {
  const response = await fetch('/api/contributors/v1')
  if (!response.ok) {
    throw new Error(`Failed to fetch contributors: ${response.statusText}`)
  }
  return response.json()
}
