import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'

export const useGetProposalSnapshot = (proposalId: string) => {
  const { data } = useReadContract({
    abi: GovernorAbi,
    address: GovernorAddress,
    functionName: 'proposalSnapshot',
    args: [BigInt(proposalId)],
  })

  return BigInt(data ?? 0n)
}
