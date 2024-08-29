import { useReadContract } from 'wagmi'
import { GovernorAddress } from '@/lib/contracts'
import { GovernorAbi } from '@/lib/abis/Governor'
import { formatUnits } from 'viem'
import { toFixed } from '@/lib/utils'

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
    const format = (value: bigint) => toFixed(formatUnits(value, 18))
    return [format(data[0]), format(data[1]), format(data[2])]
  }
  return ['0', '0', '0']
}
