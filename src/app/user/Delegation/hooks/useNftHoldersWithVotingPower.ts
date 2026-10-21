import { useCallback, useEffect, useState } from 'react'

import { ContributorApiResponse, DelegatedVotesApiResponse } from '@/app/proposals/shared/types'
import { getCachedNftHoldersShepherds } from '@/app/user/Delegation/server/fetchNftHoldersWithVotingPower'

export interface NftHolder {
  address: string
  RNS: string | null
  delegatedSince: string
  totalVotes: number
  delegators: number
  votingPower: number
  imageIpfs?: string | null
}

export const sortByVotingPower = <T extends { votingPower: number }>(holders: T[]): T[] =>
  [...holders].sort((a, b) => b.votingPower - a.votingPower)

/**
 * Fetches NFT holders, resolves RNS domains, and retrieves their voting power from the contract.
 * Returns the enriched NFT holders ordered by voting power, plus the total delegated voting power.
 */
export function useNftHoldersWithVotingPower() {
  const [nftHolders, setNftHolders] = useState<NftHolder[]>([])
  const [totalDelegatedVotes, setTotalDelegatedVotes] = useState<bigint | undefined>()

  const load = useCallback(async () => {
    // A failing total must not hide the list
    const totalPromise = fetchTotalDelegatedVotesFromAPI().then(setTotalDelegatedVotes, err => {
      console.error('Failed to fetch the total delegated votes', err)
    })

    const [contributors, cachedHolders] = await Promise.all([
      fetchContributorsFromAPI(),
      getCachedNftHoldersShepherds(),
    ])

    const cachedMap = new Map(cachedHolders.map(h => [h.address.toLowerCase(), h]))

    const merged = contributors.flatMap<NftHolder>(c => {
      const cached = cachedMap.get(c.id.toLowerCase())
      if (!cached) return []
      return [
        {
          address: c.id,
          RNS: cached.RNS ?? null,
          delegatedSince: c.createdAt,
          totalVotes: c.votes,
          delegators: c.delegators,
          imageIpfs: cached.imageIpfs,
          votingPower: cached.votingPower,
        },
      ]
    })

    setNftHolders(sortByVotingPower(merged))
    await totalPromise
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { nftHolders, totalDelegatedVotes, refetch: load }
}

export async function fetchContributorsFromAPI(): Promise<ContributorApiResponse[]> {
  const response = await fetch('/api/contributors/v1')
  if (!response.ok) {
    throw new Error(`Failed to fetch contributors: ${response.statusText}`)
  }
  return response.json()
}

export async function fetchTotalDelegatedVotesFromAPI(): Promise<bigint> {
  const response = await fetch('/api/delegated-votes/v1')
  if (!response.ok) {
    throw new Error(`Failed to fetch delegated votes: ${response.statusText}`)
  }
  const { totalDelegatedVotes }: DelegatedVotesApiResponse = await response.json()
  return BigInt(totalDelegatedVotes)
}
