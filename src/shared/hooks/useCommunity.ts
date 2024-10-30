import { useMemo, useCallback, useEffect, useState } from 'react'
import { abiContractsMap, DEFAULT_NFT_CONTRACT_ABI } from '@/lib/contracts'
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
    abi: abiContractsMap[nftAddress!] || DEFAULT_NFT_CONTRACT_ABI,
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
          { ...contract, functionName: 'name' },
          { ...contract, functionName: 'symbol' },
          { ...contract, functionName: 'stRifThreshold' },
          { ...contract, functionName: 'tokenOfOwnerByIndex', args: [address, BigInt(0)] }, // Only one token per address is assumed
        ],
      },
  )
  const { data: URI } = useReadContracts(
    address && nftAddress && data?.[6].result
      ? {
          contracts: [{ ...contract, functionName: 'tokenURI', args: [data[6].result] }],
        }
      : {},
  )

  return useMemo(() => {
    const [membersCount, tokensAvailable, balanceOf, nftName, symbol, stRifThreshold, tokenId] = data ?? []
    return {
      refetch,
      membersCount: Number(membersCount?.result ?? 0n),
      tokensAvailable: Number(tokensAvailable?.result ?? 0n),
      isMember: (balanceOf?.result ?? 0n) > 0n,
      tokenId: typeof tokenId?.result === 'bigint' ? Number(tokenId.result) : undefined,
      nftName: nftName?.result,
      nftSymbol: symbol?.result,
      nftUri: URI?.[0].result,
      isLoading,
      stRifThreshold: stRifThreshold?.result,
    }
  }, [data, refetch, isLoading, URI])
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
      abi: abiContractsMap[nftAddress] || DEFAULT_NFT_CONTRACT_ABI,
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
