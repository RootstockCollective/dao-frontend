import { fetchIpfsUri } from '@/app/user/Balances/actions'
import { EarlyAdoptersNFTAbi } from '@/lib/abis/EarlyAdoptersNFTAbi'
import { currentEnvNFTContracts } from '@/lib/contracts'
import { useEffect, useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'

export interface NFTImageProps {
  imageUrl: string
  alt: string
  description: string
  id: number
  owned: boolean
}

export const useNFTImage = () => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(true)
  const [result, setResult] = useState<NFTImageProps>({
    imageUrl: '',
    alt: '',
    description: '',
    id: 0,
    owned: false,
  })

  const { data: nftUri, isLoading: tokenUriLoading } = useReadContract({
    abi: EarlyAdoptersNFTAbi,
    address: currentEnvNFTContracts.EA,
    functionName: 'tokenUriByOwner',
    args: [address!],
  })

  useEffect(() => {
    if (nftUri && !tokenUriLoading) {
      fetchIpfsUri(nftUri as string)
        .then(async ({ name: alt, image, description }) => {
          try {
            const response = await fetchIpfsUri(image, 'blob')
            const url = URL.createObjectURL(response)
            // TODO: get id
            const id = 1
            setResult({ imageUrl: url, alt, description: description, id, owned: true })
            setIsLoading(false)
          } catch (e) {
            setIsLoading(false)
          }
        })
        .catch(() => setIsLoading(false))
    }
  }, [nftUri, isLoading, tokenUriLoading])

  return { result, isLoading }
}
