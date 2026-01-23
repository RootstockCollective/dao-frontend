import { useReadContract } from 'wagmi'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'

export function useProposalQuorumAtSnapshot(blockNumber: bigint | string | number | undefined) {
  const block = blockNumber ? BigInt(blockNumber) : undefined
  const { data, isLoading, error } = useReadContract({
    abi: GovernorAbi,
    address: GovernorAddress,
    functionName: 'quorum',
    args: block ? [block] : undefined,
    query: {
      enabled: !!block,
      refetchInterval: 10000,
    },
  })

  return {
    quorum: data ?? BigInt(0),
    isLoading,
    error,
  }
}
