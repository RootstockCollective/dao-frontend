import { useReadContract } from 'wagmi'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'

export const useGovernorThreshold = () => {
  const { data: threshold, isLoading } = useReadContract({
    abi: GovernorAbi,
    address: GovernorAddress,
    functionName: 'proposalThreshold',
  })

  return {
    threshold,
    isLoading,
  }
}
