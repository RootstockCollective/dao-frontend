import { fetchIpfsUri } from '@/app/user/Balances/actions'
import { config } from '@/config'
import { abiContractsMap } from '@/lib/contracts'
import { readContracts } from '@wagmi/core'
import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

export interface NFTImageProps {
  imageUrl: string
  alt: string
  description: string
  tokenId: bigint
  owned: boolean
}

export const useNFTImage = (nftAddress: Address | undefined) => {
  const { address } = useAccount()
  const [isLoadingContractData, setIsLoadingContract] = useState(!!address)
  const [nftUri, setNftUri] = useState('')

  const [isLoadingImage, setIsLoadingImage] = useState(!!address)
  const [data, setData] = useState<NFTImageProps>({
    imageUrl: '',
    alt: '',
    description: '',
    tokenId: 0n,
    owned: false,
  })

  // load contract data and get NFT URI and tokenId by owner
  useEffect(() => {
    if (isLoadingContractData && nftAddress && address) {
      const defaultNftConfig = {
        abi: abiContractsMap[nftAddress.toLowerCase()] as any,
        address: nftAddress,
      } as const

      readContracts(config, {
        allowFailure: false,
        contracts: [
          {
            ...defaultNftConfig,
            functionName: 'tokenUriByOwner',
            args: [address!],
          },
          {
            ...defaultNftConfig,
            functionName: 'tokenIdByOwner',
            args: [address!],
          },
        ],
      })
        .then(contractData => {
          const [nftUri, tokenId] = contractData as [string, bigint]
          setData({ ...data, tokenId, owned: true })
          setNftUri(nftUri)
          setIsLoadingContract(false)
        })
        .catch(() => setIsLoadingContract(false))
    }
  }, [isLoadingContractData, nftAddress, address, data])

  // load NFT image and metadata
  useEffect(() => {
    if (!isLoadingContractData && isLoadingImage) {
      setIsLoadingImage(false)
      if (nftUri) {
        fetchIpfsUri(nftUri as string).then(async ({ name: alt, image, description }) => {
          const response = await fetchIpfsUri(image, 'blob')
          const url = URL.createObjectURL(response)
          setData({ ...data, imageUrl: url, alt, description })
        })
      }
    }
  }, [isLoadingContractData, isLoadingImage, nftUri, data])

  return { data, isLoadingImage }
}
