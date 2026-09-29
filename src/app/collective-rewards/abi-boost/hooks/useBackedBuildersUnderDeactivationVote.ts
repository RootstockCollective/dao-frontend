import { useContext, useMemo } from 'react'
import { Address, getAddress } from 'viem'
import { useBlockNumber } from 'wagmi'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { useGetProposalsWithGraph } from '@/app/proposals/hooks/useGetProposalsWithGraph'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

import { getOpenDeactivationVotes, getSecondsUntilVoteEnds } from '../deactivationVotes.utils'

export interface BackedBuilderUnderVote {
  builder: Address
  builderName: string
  proposalId: string
  /** Estimated seconds until the vote closes. */
  secondsLeft: number
}

/**
 * Builders the connected wallet backs on-chain that are the target of an open deactivation vote.
 * Recomputed from live data, so a Builder drops out as soon as the backing is moved elsewhere or
 * the vote closes.
 */
export const useBackedBuildersUnderDeactivationVote = (): BackedBuilderUnderVote[] => {
  const {
    initialState: { allocations },
  } = useContext(AllocationsContext)
  const { getBuilderByAddress } = useBuilderContext()
  const { data: proposals } = useGetProposalsWithGraph()
  const { data: currentBlock } = useBlockNumber({
    query: { refetchInterval: AVERAGE_BLOCKTIME, staleTime: AVERAGE_BLOCKTIME },
  })

  return useMemo(() => {
    // Without the current block the time left can't be told, and a wrong countdown is worse than none
    if (currentBlock === undefined) return []

    const votes = getOpenDeactivationVotes(proposals)
    if (!votes.size) return []

    return Object.entries(allocations)
      .filter(([, allocation]) => allocation > 0n)
      .flatMap(([address]) => {
        const vote = votes.get(getAddress(address))
        if (!vote) return []
        return [
          {
            builder: vote.builder,
            builderName: getBuilderByAddress(vote.builder)?.builderName || vote.builder,
            proposalId: vote.proposalId,
            secondsLeft: getSecondsUntilVoteEnds(vote.voteEndBlock, currentBlock),
          },
        ]
      })
      .sort((a, b) => a.secondsLeft - b.secondsLeft)
  }, [allocations, proposals, currentBlock, getBuilderByAddress])
}
