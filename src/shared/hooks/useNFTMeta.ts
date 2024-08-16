import { fetchIpfsUri } from '@/app/user/Balances/actions'
import { abiContractsMap } from '@/lib/contracts'
import { useReadContract } from 'wagmi'
import { useEffect, useState, useMemo } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { NftMeta } from '../types'
import { DEFAULT_NFT_BASE64 } from '../defaultNFT'

interface MetaReturnType {
  /**
   * Early Adopters NFT metadata
   */
  meta?: NftMeta
  /**
   * NFT image loading status
   */
  isLoadingNftImage: boolean
}

/**
 * Reads metadata of the Early Adopters community NFT owned by the address
 * and substitutes image URI with a blob
 * @param nftAddress NFT smart contract address
 * @returns NFT metadata
 */
export const useNftMeta = (nftAddress?: Address): MetaReturnType => {
  const { address } = useAccount()
  const [isLoadingNftImage, setIsLoadingNftImage] = useState(!!address)
  const [meta, setMeta] = useState<NftMeta>()

  // load contract data and get NFT URI and tokenId by owner
  const { data: nftUri } = useReadContract(
    address &&
      nftAddress && {
        abi: abiContractsMap[nftAddress],
        address: nftAddress,
        functionName: 'tokenUriByOwner',
        args: [address],
      },
  )

  // load NFT image and metadata
  useEffect(() => {
    if (!nftUri) return
    setIsLoadingNftImage(true)
    fetchIpfsUri(nftUri)
      .then(async nftMeta => {
        const response = await fetchIpfsUri(nftMeta.image, 'blob')
        const url = URL.createObjectURL(response)
        setMeta({ ...nftMeta, image: url })
      })
      .finally(() => setIsLoadingNftImage(false))
  }, [nftUri])

  return useMemo<MetaReturnType>(() => ({ meta, isLoadingNftImage }), [meta, isLoadingNftImage])
}
