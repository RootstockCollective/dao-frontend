import { fetchIpfsUri } from '@/app/user/Balances/actions'
import { EarlyAdoptersNFTAbi } from '@/lib/abis/EarlyAdoptersNFTAbi'
import { currentEnvNFTContracts } from '@/lib/contracts'
import { useEffect, useState } from 'react'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'

export interface NFTImageProps {
  imageUrl: string
  alt: string
  description: string
  tokenId: bigint
  owned: boolean
}

export const useNFTImage = () => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(true)
  const [result, setResult] = useState<NFTImageProps>({
    imageUrl: '',
    alt: '',
    description: '',
    tokenId: 0n,
    owned: false,
  })

  const { data, isLoading: isLoadingNftData } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        abi: EarlyAdoptersNFTAbi,
        address: currentEnvNFTContracts.EA,
        functionName: 'tokenUriByOwner',
        args: [address!],
      },
      {
        abi: EarlyAdoptersNFTAbi,
        address: currentEnvNFTContracts.EA,
        functionName: 'tokenIdByOwner',
        args: [address!],
      },
    ],
  })

  useEffect(() => {
    if (!isLoadingNftData) {
      const [nftUri, tokenId] = data as [string, bigint]

      fetchIpfsUri(nftUri as string)
        .then(async ({ name: alt, image, description }) => {
          try {
            const response = await fetchIpfsUri(image, 'blob')
            const url = URL.createObjectURL(response)
            setResult({ imageUrl: url, alt, description: description, tokenId, owned: true })
            setIsLoading(false)
          } catch (e) {
            setIsLoading(false)
          }
        })
        .catch(() => setIsLoading(false))
    }
  }, [isLoading, isLoadingNftData, data])

  return { result, isLoading }
}
