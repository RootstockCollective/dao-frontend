import { useMemo } from 'react'
import { abiContractsMap } from '@/lib/contracts'
import { Address } from 'viem'
import { useReadContracts, useAccount } from 'wagmi'

/**
 * useCommunity hook return properties
 */
interface CommunityData {
  /**
   * The remaining number of tokens that can be minted
   */
  tokensAvailable: number
  /**
   * Number of community members who received tokens
   */
  membersCount: number
  /**
   * Tells whether the user is a member of the community
   */
  isMember: boolean
  /**
   * Serial number of the token minted for the user
   */
  tokenId: number | undefined
  /**
   * NFT smart contract name
   */
  nftName: string | undefined
}

/**
 * Reads different Early Adopters NFT contract functions
 * @param nftAddress deployed contract address
 * @returns community NFT view functions call results
 */
export const useCommunity = (nftAddress?: Address): CommunityData => {
  const { address } = useAccount()
  const contract = {
    // verifying `nftAddress` later in `useReadContracts` params
    abi: abiContractsMap[nftAddress!],
    address: nftAddress,
  }
  const { data } = useReadContracts(
    address &&
      nftAddress && {
        contracts: [
          {
            ...contract,
            functionName: 'totalSupply',
          },
          {
            ...contract,
            functionName: 'tokensAvailable',
          },
          {
            ...contract,
            functionName: 'balanceOf',
            args: [address],
          },
          {
            ...contract,
            functionName: 'tokenIdByOwner',
            args: [address],
          },
          {
            ...contract,
            functionName: 'name',
          },
        ],
      },
  )

  return useMemo(() => {
    const [membersCount, tokensAvailable, balanceOf, tokenIdByOwner, nftName] = data ?? []
    const communityData: CommunityData = {
      tokensAvailable: Number(tokensAvailable?.result ?? 0n),
      membersCount: Number(membersCount?.result ?? 0n),
      isMember: (balanceOf?.result ?? 0n) > 0n,
      tokenId: typeof tokenIdByOwner?.result === 'bigint' ? Number(tokenIdByOwner.result) : undefined,
      nftName: nftName?.result,
    }
    return communityData
  }, [data])
}
