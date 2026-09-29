import { useQuery } from '@tanstack/react-query'
import { useContext, useMemo } from 'react'
import { Address, getAddress } from 'viem'
import { useBlockNumber, useReadContracts } from 'wagmi'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { fetchProposalsFromAPI, PROPOSALS_QUERY_KEY } from '@/app/proposals/hooks/useGetProposalsWithGraph'
import { calculateTimeRemaining } from '@/components/Countdown'
import { GovernorAbi } from '@/lib/abis/Governor'
import Big from '@/lib/big'
import { AVERAGE_BLOCKTIME, GOVERNOR_ADDRESS } from '@/lib/constants'
import { ProposalState } from '@/shared/types'

import { getDeactivationVoteCandidates, pickOpenDeactivationVotes } from '../deactivationVotes.utils'

export interface BackedBuilderUnderVote {
  builder: Address
  builderName: string
  proposalId: string
  /** Estimated seconds until the vote closes. */
  secondsLeft: number
}

/**
 * Builders the connected wallet backs on-chain that are the target of an open deactivation vote.
 *
 * The proposals list comes from the cache every proposals screen shares; the on-chain state is read
 * only for deactivation proposals against these Builders whose window is still open, which is
 * usually none. Recomputed from live data, so a Builder drops out as soon as the backing moves
 * elsewhere or the vote closes.
 */
export const useBackedBuildersUnderDeactivationVote = (): BackedBuilderUnderVote[] => {
  const {
    initialState: { allocations },
  } = useContext(AllocationsContext)
  const { getBuilderByAddress } = useBuilderContext()
  const { data: proposals } = useQuery({
    queryKey: PROPOSALS_QUERY_KEY,
    queryFn: fetchProposalsFromAPI,
    refetchInterval: AVERAGE_BLOCKTIME,
  })
  const { data: currentBlock } = useBlockNumber({
    query: { refetchInterval: AVERAGE_BLOCKTIME, staleTime: AVERAGE_BLOCKTIME },
  })

  const candidates = useMemo(() => {
    // Without the current block the time left can't be told, and a wrong countdown is worse than none
    if (currentBlock === undefined || !proposals?.length) return []
    const backedBuilders = new Set(
      Object.entries(allocations)
        .filter(([, allocation]) => allocation > 0n)
        .map(([address]) => getAddress(address)),
    )
    return backedBuilders.size ? getDeactivationVoteCandidates(proposals, backedBuilders, currentBlock) : []
  }, [allocations, proposals, currentBlock])

  const { data: states } = useReadContracts({
    contracts: candidates.map(({ proposalId }) => ({
      address: GOVERNOR_ADDRESS,
      abi: GovernorAbi,
      functionName: 'state' as const,
      args: [BigInt(proposalId)] as const,
    })),
    query: { enabled: candidates.length > 0, refetchInterval: AVERAGE_BLOCKTIME },
  })

  return useMemo(() => {
    if (currentBlock === undefined || !states) return []
    const proposalStates = states.map(({ status, result }) =>
      status === 'success' ? (Number(result) as ProposalState) : undefined,
    )

    return pickOpenDeactivationVotes(candidates, proposalStates)
      .map(({ builder, proposalId, voteEndBlock }) => ({
        builder,
        builderName: getBuilderByAddress(builder)?.builderName || builder,
        proposalId,
        secondsLeft: calculateTimeRemaining(
          Big(voteEndBlock.toString()),
          Big(currentBlock.toString()),
          'blocks',
        ),
      }))
      .sort((a, b) => a.secondsLeft - b.secondsLeft)
  }, [candidates, states, currentBlock, getBuilderByAddress])
}
