import { useBlockNumber, useReadContract } from 'wagmi'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'

export const useGetProposalDeadline = (proposalId: string) => {
  const { data: proposalDeadlineBlock } = useReadContract({
    abi: GovernorAbi,
    address: GovernorAddress,
    functionName: 'proposalDeadline',
    args: [BigInt(proposalId)],
  })

  const { data: latestBlockNumber } = useBlockNumber()

  let blocksUntilClosure = null
  if (proposalDeadlineBlock && latestBlockNumber) {
    blocksUntilClosure = proposalDeadlineBlock - latestBlockNumber
    if (blocksUntilClosure < 0) {
      blocksUntilClosure = 0
    }
  }

  return {
    proposalDeadlineBlock,
    latestBlockNumber,
    blocksUntilClosure,
  }
}
