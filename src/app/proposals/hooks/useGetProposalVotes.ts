import { useReadContract } from 'wagmi'
import { GovernorAddress } from '@/lib/contracts'
import { GovernorAbi } from '@/lib/abis/Governor'
import { formatUnits } from 'viem'
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
    return [formatUnits(data[0], 18), formatUnits(data[1], 18), formatUnits(data[2], 18)]
  }
  return ['0', '0', '0']
}
