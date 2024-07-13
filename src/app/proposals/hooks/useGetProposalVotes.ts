import { useReadContract } from 'wagmi'
import { GovernorAddress } from '@/lib/contracts'
import { GovernorAbi } from '@/lib/abis/Governor'
// 0 = against, 1 = forVotes, 2 = abstain
export const useGetProposalVotes = (proposalId: string, shouldRefetch = false) => {
  const { data } = useReadContract({
    address: GovernorAddress,
    abi: GovernorAbi,
    functionName: 'proposalVotes',
    args: [BigInt(proposalId)],
    query: {
      ...(shouldRefetch && { refetchInterval: 5000 }),
    },
  })

  return data || [0n, 0n, 0n]
}
