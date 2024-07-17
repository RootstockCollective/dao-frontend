import { EarlyAdoptersNFTAbi } from '@/lib/abis/EarlyAdoptersNFTAbi'
import { currentEnvNFTContracts } from '@/lib/contracts'
import { useWriteContract } from 'wagmi'
import { useCidsAvailable } from './useCidsAvailable'

export const useMintNFT = () => {
  const { cidsAvailable } = useCidsAvailable()
  const { writeContractAsync: mint } = useWriteContract()

  const onMintNFT = async () => {
    if (!cidsAvailable) {
      throw new Error('No NFTs available to mint')
    }

    return await mint({
      abi: EarlyAdoptersNFTAbi,
      address: currentEnvNFTContracts.EA,
      functionName: 'mint',
      args: [],
    })
  }

  return { onMintNFT }
}
