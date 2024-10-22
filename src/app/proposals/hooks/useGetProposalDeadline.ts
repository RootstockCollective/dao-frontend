import { useBlockNumber, useReadContract } from 'wagmi'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'
import { useEffect } from 'react'

export const useGetProposalDeadline = (
  proposalId: string,
  passedLatestBlockNumber?: bigint,
  fetchOnMount = true,
) => {
  const { data: proposalDeadlineBlock, refetch: fetchProposalDeadlineBlock } = useReadContract({
    abi: GovernorAbi,
    address: GovernorAddress,
    functionName: 'proposalDeadline',
    args: [BigInt(proposalId)],
    query: {
      enabled: false,
    },
  })
  const { data: latestBlockNumber, refetch: fetchLatestBlockNumber } = useBlockNumber({
    query: {
      enabled: false,
    },
  })

  /**
   * When the fetchOnMount changes, fetch deadline block and latest block number
   */
  useEffect(() => {
    if (fetchOnMount) {
      fetchProposalDeadlineBlock()
      if (!passedLatestBlockNumber) {
        fetchLatestBlockNumber()
      }
    }
  }, [fetchOnMount])
  /**
   * Hook to fetch latest block number if passedLatestBlockNumber is undefined
   */
  useEffect(() => {
    if (!passedLatestBlockNumber && fetchOnMount) {
      fetchLatestBlockNumber()
    }
  }, [passedLatestBlockNumber])

  const latestBlockNumberToUse = passedLatestBlockNumber || latestBlockNumber

  let blocksUntilClosure = null
  if (proposalDeadlineBlock && latestBlockNumberToUse) {
    blocksUntilClosure = proposalDeadlineBlock - latestBlockNumberToUse
    if (blocksUntilClosure < 0) {
      blocksUntilClosure = 0
    }
  }

  return {
    proposalDeadlineBlock,
    latestBlockNumber: latestBlockNumberToUse,
    blocksUntilClosure,
  }
}
