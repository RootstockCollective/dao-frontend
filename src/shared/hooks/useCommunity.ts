import { readContracts } from 'wagmi/actions'
import { useMemo, useCallback, useEffect, useState } from 'react'
import { abiContractsMap, DEFAULT_NFT_CONTRACT_ABI } from '@/lib/contracts'
import { Address } from 'viem'
import { useReadContracts, useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { fetchIpfsNftMeta, ipfsGatewayUrl } from '@/lib/ipfs'
import { NftMeta, CommunityData } from '../types'
import { config } from '@/config'
import Big from '@/lib/big'
import { useQuery } from '@tanstack/react-query'
import { axiosInstance, splitWords } from '@/lib/utils/utils'
import { NftDataFromAddressesReturnType } from '@/app/user/api/communities/route'
import { communitiesMapByContract } from '@/app/communities/communityUtils'

/**
 * Hook for loading NFT metadata from IPFS
 */
const useNftMeta = (nftUri?: string) => {
  const [nftMeta, setNftMeta] = useState<NftMeta>()

  useEffect(() => {
    if (!nftUri) return setNftMeta(undefined)
    fetchIpfsNftMeta(nftUri)
      .then(nftMeta => setNftMeta({ ...nftMeta, image: ipfsGatewayUrl(nftMeta.image) }))
      .catch(error => {
        console.log('🚀 ~ useCommunity.ts ~ useNftMeta ~ useEffect ~ error:', error)
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
          { ...contract, functionName: 'balanceOf', args: [address] },
          { ...contract, functionName: 'tokenOfOwnerByIndex', args: [address, BigInt(0)] }, // Only one token per address is assumed
        ],
      },
  )
  const { data: URI } = useReadContracts(
    address && nftAddress && data?.[1].result
      ? {
          contracts: [{ ...contract, functionName: 'tokenURI', args: [data[1].result] }],
        }
      : {},
  )

  const { data: nftData = {} } = useQuery({
    queryKey: ['nftInfo'],
    queryFn: () =>
      axiosInstance
        .get<NftDataFromAddressesReturnType>('/user/api/communities', { baseURL: '/' })
        .then(({ data }) => data),
  })

  return useMemo(() => {
    const [balanceOf, tokenId] = data ?? []
    const {
      totalSupply: membersCount = 0,
      tokensAvailable = 0,
      name: nftName,
      symbol,
      stRifThreshold,
    } = nftAddress && nftAddress in nftData ? nftData[nftAddress] : {}

    return {
      refetch,
      membersCount: Number(membersCount),
      tokensAvailable: Number(tokensAvailable),
      isMember: Big(balanceOf?.result?.toString() ?? 0).gt(0),
      tokenId: typeof tokenId?.result === 'bigint' ? Number(tokenId.result) : undefined,
      // NFT name from predefined communities list or from NFT metadata if not listed
      nftName: communitiesMapByContract[nftAddress as string]?.title ?? splitWords(nftName),
      nftSymbol: symbol,
      nftUri: URI?.[0].result,
      stRifThreshold: stRifThreshold ? BigInt(stRifThreshold) : undefined,
      isLoading,
    }
  }, [data, nftData, nftAddress, refetch, URI, isLoading])
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
    return mint({
      abi: abiContractsMap[nftAddress] || DEFAULT_NFT_CONTRACT_ABI,
      address: nftAddress,
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
 * Hook returning all information about NFT community
 */
export const useCommunity = (nftAddress?: Address): CommunityData => {
  const { refetch, ...data } = useContractData(nftAddress)
  const { onMintNFT, isPending, isSuccess } = useMintNFT(nftAddress, data.tokensAvailable)

  const nftMeta = useNftMeta(data.nftUri)

  const onReadFunctions = useCallback(
    (functions: { functionName: string; args: string[] }[]) => {
      if (!nftAddress) throw new Error('Unknown NFT address')
      return readContracts(config, {
        contracts: functions.map(({ functionName, args }) => ({
          abi: abiContractsMap[nftAddress] || DEFAULT_NFT_CONTRACT_ABI,
          address: nftAddress,
          functionName,
          args,
        })),
      })
    },
    [nftAddress],
  )

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
        onReadFunctions,
        nftMeta,
      }) satisfies CommunityData,
    [data, isPending, nftMeta, onReadFunctions, onMintNFT],
  )
}
