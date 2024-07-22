import { abiContractsMap } from '@/lib/contracts'
import { Address } from 'viem'
import { useWriteContract } from 'wagmi'
import { useCidsAvailable } from './useCidsAvailable'

export const useMintNFT = (nftAddress: Address | undefined) => {
  const { cidsAvailable } = useCidsAvailable(nftAddress)
  const { writeContractAsync: mint } = useWriteContract()

  const onMintNFT = async () => {
    if (!cidsAvailable) {
      throw new Error('No NFTs available to mint')
    }

    return await mint({
      abi: abiContractsMap[nftAddress?.toLowerCase() as string],
      address: nftAddress || '0x0',
      functionName: 'mint',
      args: [],
    })
  }

  return { onMintNFT }
}
