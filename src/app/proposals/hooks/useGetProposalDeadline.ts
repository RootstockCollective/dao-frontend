import { useBlockNumber, useReadContract } from 'wagmi'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'
import { useEffect, useRef } from 'react'

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

  // Store the fetch functions in refs
  const fetchProposalDeadlineBlockRef = useRef(fetchProposalDeadlineBlock)
  const fetchLatestBlockNumberRef = useRef(fetchLatestBlockNumber)
  const hasRunDeadlineBlockFetch = useRef(false)
  const hasRunLatestBlockFetch = useRef(false)

  // Keep refs updated
  useEffect(() => {
    fetchProposalDeadlineBlockRef.current = fetchProposalDeadlineBlock
    fetchLatestBlockNumberRef.current = fetchLatestBlockNumber
  }, [fetchProposalDeadlineBlock, fetchLatestBlockNumber])

  /**
   * When the fetchOnMount changes, fetch deadline block and latest block number ONCE
   */
  useEffect(() => {
    if (fetchOnMount) {
      if (!hasRunDeadlineBlockFetch.current) {
        fetchProposalDeadlineBlockRef.current()
        hasRunDeadlineBlockFetch.current = true
      }
      if (!passedLatestBlockNumber && !hasRunLatestBlockFetch.current) {
        fetchLatestBlockNumberRef.current()
        hasRunLatestBlockFetch.current = true
      }
    }
  }, [fetchOnMount, passedLatestBlockNumber])

  /**
   * Hook to fetch latest block number if passedLatestBlockNumber is undefined ONCE
   */
  useEffect(() => {
    if (!passedLatestBlockNumber && fetchOnMount && !hasRunLatestBlockFetch.current) {
      fetchLatestBlockNumberRef.current()
      hasRunLatestBlockFetch.current = true
    }
  }, [passedLatestBlockNumber, fetchOnMount])

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
