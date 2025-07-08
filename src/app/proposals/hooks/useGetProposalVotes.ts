import { useReadContract } from 'wagmi'
import { GovernorAddress } from '@/lib/contracts'
import { GovernorAbi } from '@/lib/abis/Governor'

const zero = BigInt(0)

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

  if (data) {
    return [data[0], data[1], data[2]]
  }
  return [zero, zero, zero]
}
