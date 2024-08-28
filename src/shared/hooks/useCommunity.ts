import { useMemo, useCallback, useEffect, useState } from 'react'
import { abiContractsMap } from '@/lib/contracts'
import { Address } from 'viem'
import { useReadContracts, useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { fetchIpfsUri } from '@/app/user/Balances/actions'
import { NftMeta } from '../types'
import { CommunityData } from './types'

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
  const { data, refetch } = useReadContracts(
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
        ],
      },
  )

  return { data, refetch }
}

/**
 * Hook for executing and watching NFT mint transaction
 */
const useMintNFT = (nftAddress?: Address, tokensAvailable?: bigint) => {
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

  return { onMintNFT, isPending: isLoading || isPending, isSuccess }
}

/**
 * Hook returning all information about Early Adopters community
 */
export const useCommunity = (nftAddress?: Address): CommunityData => {
  const { data, refetch } = useContractData(nftAddress)
  const { onMintNFT, isPending, isSuccess } = useMintNFT(nftAddress, data?.[1]?.result)
  const nftMeta = useNftMeta(data?.[6]?.result)

  useEffect(() => {
    if (isSuccess) {
      refetch()
    }
  }, [isSuccess, refetch])

  return useMemo(() => {
    const [membersCount, tokensAvailable, balanceOf, tokenIdByOwner, nftName, symbol] = data ?? []
    return {
      tokensAvailable: Number(tokensAvailable?.result ?? 0n),
      membersCount: Number(membersCount?.result ?? 0n),
      isMember: (balanceOf?.result ?? 0n) > 0n,
      tokenId: typeof tokenIdByOwner?.result === 'bigint' ? Number(tokenIdByOwner.result) : undefined,
      nftName: nftName?.result,
      nftSymbol: symbol?.result,
      mint: {
        onMintNFT,
        isPending,
      },
      nftMeta,
    }
  }, [data, isPending, nftMeta, onMintNFT])
}
