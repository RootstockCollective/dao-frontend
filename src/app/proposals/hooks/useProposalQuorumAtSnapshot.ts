import { useReadContract } from 'wagmi'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'
import { formatEther } from 'viem'
import { formatNumberWithCommas } from '@/lib/utils'
import Big from 'big.js'

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
