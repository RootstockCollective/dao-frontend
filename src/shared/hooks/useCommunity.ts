import { useMemo, useCallback, useEffect, useState } from 'react'
import { abiContractsMap } from '@/lib/contracts'
import { Address } from 'viem'
import { useReadContracts, useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { fetchIpfsUri } from '@/app/user/Balances/actions'
import { NftMeta, CommunityData } from '../types'

/**
 * Hook for loading NFT metadata from IPFS
 */
const useNftMeta = (nftUri?: string) => {
  const [nftMeta, setNftMeta] = useState<NftMeta>()

  useEffect(() => {
    if (!nftUri) return setNftMeta(undefined)
    fetchIpfsUri(nftUri).then(async nftMeta => {
      const response = await fetchIpfsUri(nftMeta.image, 'blob')
      const url = URL.createObjectURL(response)
      setNftMeta({ ...nftMeta, image: url })
    })
  }, [nftUri])

  return nftMeta
}

/**
 * Hook for reading NFT contract view functions
 */
export const useContractData = (nftAddress?: Address) => {
  const { address } = useAccount()
  const contract = {
    // verifying `nftAddress` later in `useReadContracts` params
    abi: abiContractsMap[nftAddress!],
    address: nftAddress,
  }

  // load data from the contract view functions
  const { data, refetch, isLoading } = useReadContracts(
    address &&
      nftAddress && {
        contracts: [
          { ...contract, functionName: 'totalSupply' },
          { ...contract, functionName: 'tokensAvailable' },
          { ...contract, functionName: 'balanceOf', args: [address] },
          { ...contract, functionName: 'tokenIdByOwner', args: [address] },
          { ...contract, functionName: 'name' },
          { ...contract, functionName: 'symbol' },
          { ...contract, functionName: 'tokenUriByOwner', args: [address] },
          { ...contract, functionName: 'stRifThreshold' },
        ],
      },
  )

  return useMemo(() => {
    const [
      membersCount,
      tokensAvailable,
      balanceOf,
      tokenIdByOwner,
      nftName,
      symbol,
      nftUri,
      stRifThreshold,
    ] = data ?? []
    return {
      refetch,
      membersCount: Number(membersCount?.result ?? 0n),
      tokensAvailable: Number(tokensAvailable?.result ?? 0n),
      isMember: (balanceOf?.result ?? 0n) > 0n,
      tokenId: typeof tokenIdByOwner?.result === 'bigint' ? Number(tokenIdByOwner.result) : undefined,
      nftName: nftName?.result,
      nftSymbol: symbol?.result,
      nftUri: nftUri?.result,
      isLoading,
      stRifThreshold: stRifThreshold?.result,
    }
  }, [data, refetch, isLoading])
}

/**
 * Hook for executing and watching NFT mint transaction
 */
const useMintNFT = (nftAddress?: Address, tokensAvailable?: number) => {
  const { writeContractAsync: mint, isPending, data: hash } = useWriteContract()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  const onMintNFT = useCallback(async () => {
    if (!nftAddress) throw new Error('Unknown NFT address')
    if (!tokensAvailable) throw new Error('No NFTs available to mint')
    return await mint({
      abi: abiContractsMap[nftAddress],
      address: nftAddress || '0x0',
      functionName: 'mint',
      args: [],
    })
  }, [mint, nftAddress, tokensAvailable])

  return useMemo(
    () => ({ onMintNFT, isPending: isLoading || isPending, isSuccess }),
    [isLoading, isPending, isSuccess, onMintNFT],
  )
}

/**
 * Hook returning all information about Early Adopters community
 */
export const useCommunity = (nftAddress?: Address): CommunityData => {
  const { refetch, ...data } = useContractData(nftAddress)
  const { onMintNFT, isPending, isSuccess } = useMintNFT(nftAddress, data.tokensAvailable)
  const nftMeta = useNftMeta(data.nftUri)

  useEffect(() => {
    if (isSuccess) refetch()
  }, [isSuccess, refetch])

  return useMemo(
    () =>
      ({
        ...data,
        mint: {
          onMintNFT,
          isPending,
        },
        nftMeta,
      }) satisfies CommunityData,
    [data, isPending, nftMeta, onMintNFT],
  )
}
