import { useBlockNumber, useReadContract } from 'wagmi'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'

// Dummy hook that simply returns the value passed to it
const dummyHook = (blockNumber?: bigint) => ({ data: blockNumber })

const useLatestBlockNumber = (passedLatestBlockNumber: bigint | undefined) => {
  // Call the appropriate hook based on passedLatestBlockNumber
  const hookToUse = passedLatestBlockNumber ? dummyHook : useBlockNumber
  const { data } = hookToUse(passedLatestBlockNumber)
  return data
}

export const useGetProposalDeadline = (proposalId: string, passedLatestBlockNumber?: bigint) => {
  const { data: proposalDeadlineBlock } = useReadContract({
    abi: GovernorAbi,
    address: GovernorAddress,
    functionName: 'proposalDeadline',
    args: [BigInt(proposalId)],
  })
  const latestBlockNumber = useLatestBlockNumber(passedLatestBlockNumber)

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
