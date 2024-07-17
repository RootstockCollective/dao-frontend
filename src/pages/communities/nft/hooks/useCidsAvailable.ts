import { EarlyAdoptersNFTAbi } from '@/lib/abis/EarlyAdoptersNFTAbi'
import { currentEnvNFTContracts } from '@/lib/contracts'
import { useReadContract } from 'wagmi'

export const useCidsAvailable = () => {
  const { data } = useReadContract({
    abi: EarlyAdoptersNFTAbi,
    address: currentEnvNFTContracts.EA,
    functionName: 'cidsAvailable',
  })

  return { cidsAvailable: (data || 0n) as bigint }
}
