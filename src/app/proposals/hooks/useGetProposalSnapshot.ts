import { useReadContract } from 'wagmi'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'

export const useGetProposalSnapshot = (proposalId: string) => {
  const { data } = useReadContract({
    abi: GovernorAbi,
    address: GovernorAddress,
    functionName: 'proposalSnapshot',
    args: [BigInt(proposalId)],
  })

  return data
}
