import { useReadContract } from 'wagmi'
import { GovernorAddress } from '@/lib/contracts'
import { GovernorAbi } from '@/lib/abis/Governor'

export const useGetProposalVotes = (proposalId: string) => {
  const { data } = useReadContract({
    address: GovernorAddress,
    abi: GovernorAbi,
    functionName: 'proposalVotes',
    args: [BigInt(proposalId)],
  })

  return data
}
