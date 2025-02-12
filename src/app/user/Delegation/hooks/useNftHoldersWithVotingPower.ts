import { useState, useEffect, useCallback, useMemo } from 'react'
import { formatEther } from 'viem'
import { useFetchNftHolders } from '@/shared/hooks/useFetchNftHolders'
import { useReadContracts } from 'wagmi'
import { OG_CONTRIBUTORS_NFT_ADDRESS, CHAIN_ID } from '@/lib/constants'
import { shepherds } from './shepherds-mainnet'
import { resolveRnsDomain } from '@/lib/rns'
import { stRif } from '@/lib/contracts'

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
  const nftHoldersData = useFetchNftHolders(OG_CONTRIBUTORS_NFT_ADDRESS)

  const fetchHolders = useCallback(async () => {
    const holders =
      CHAIN_ID === '30'
        ? shepherds // Use hardcoded values for mainnet as a temporary solution
        : await Promise.all(
            nftHoldersData.currentResults?.map(async ({ owner }) => {
              try {
                return { address: owner, RNS: await resolveRnsDomain(owner) }
              } catch {
                return { address: owner, RNS: null }
              }
            }) ?? [],
          )
    setNftHolders(holders)
  }, [nftHoldersData.currentResults])

  useEffect(() => {
    fetchHolders()
  }, [fetchHolders])

  // Prepare contract calls to fetch voting power
  const stRifContractCalls = useMemo(
    () =>
      nftHolders.map(({ address }) => ({
        ...stRif,
        functionName: 'getVotes',
        args: [address.toLowerCase()],
      })),
    [nftHolders],
  )
  const { data: votingPowerResults } = useReadContracts({ contracts: stRifContractCalls })

  // Merge voting power data into nftHolders
  useEffect(() => {
    if (!votingPowerResults) return
    const updatedHolders = nftHolders
      .map((holder, i) => ({
        ...holder,
        votingPower: Number(formatEther((votingPowerResults[i]?.result as bigint) ?? 0n)),
      }))
      // pick only shepherds with voting power
      .filter(({ votingPower }) => votingPower > 0)
    setNftHolders(updatedHolders)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votingPowerResults])

  return nftHolders
}
