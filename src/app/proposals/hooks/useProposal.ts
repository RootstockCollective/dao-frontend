import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'

export const useProposal = () => {
  const { data: proposalCount, isLoading } = useReadContract({
    abi: GovernorAbi,
    address: GovernorAddress,
    functionName: 'proposalCount',
  })

  return {
    proposalCount: isLoading ? '-' : (proposalCount as bigint).toString(),
    primitiveProposalCount: proposalCount,
  }
}
