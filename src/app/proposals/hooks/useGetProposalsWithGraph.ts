import { useMemo } from 'react'
import { useBlockNumber } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { getCachedProposals, ProposalGraphQLResponse } from '@/app/proposals/actions/proposalsAction'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import Big from '@/lib/big'
import { getProposalEventArguments, getProposalCategoryFromParsedData } from '@/app/proposals/shared/utils'
import { Address, formatEther } from 'viem'
import { ProposalState } from '@/shared/types'
import { Proposal } from '../shared/types'

export function useGetProposalsWithGraph() {
  const {
    data: proposalsData,
    isLoading: proposalDataIsLoading,
    error: proposalsDataError,
  } = useQuery({
    queryFn: () => getCachedProposals(),
    queryKey: ['proposals'],
    refetchInterval: AVERAGE_BLOCKTIME,
  })
  const { data: latestBlockNumber } = useBlockNumber({
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      staleTime: AVERAGE_BLOCKTIME,
    },
  })

  const activeProposalCount = useMemo(() => {
    if (!proposalsData || !latestBlockNumber) return '0'

    return proposalsData.proposals
      .filter(
        (proposal: ProposalGraphQLResponse) =>
          handleProposalState(proposal, latestBlockNumber) === ProposalState.Active,
      )
      .length.toString()
  }, [proposalsData, latestBlockNumber])

  const totalProposalCount = useMemo(() => {
    if (!proposalsData) return '0'
    return proposalsData.counters.find(e => e.id === 'proposals')?.count || '0'
  }, [proposalsData])

  const activeProposals: Proposal[] = []
  const inactiveProposals: Proposal[] = []

  const proposalResponse = proposalsData?.proposals.map(proposal => {
    const againstVotes = Big(proposal.votesAgainst).div(Big('1e18')).round()
    const forVotes = Big(proposal.votesFor).div(Big('1e18')).round()
    const abstainVotes = Big(proposal.votesAbstains).div(Big('1e18')).round()
    const deadlineBlock = Big(proposal.voteEnd)
    const creationBlock = Number(proposal.createdAtBlock)
    const eventArgs = getProposalEventArguments({
      args: {
        description: proposal.description,
        proposalId: BigInt(proposal.proposalId),
        proposer: proposal.proposer.id as Address,
        targets: proposal.targets,
        values: proposal.values.map(value => (value ? BigInt(value) : 0n)),
        calldatas: proposal.calldatas,
        voteStart: BigInt(proposal.voteStart),
        voteEnd: BigInt(proposal.voteEnd),
      },
      timeStamp: proposal.createdAt,
      blockNumber: proposal.createdAtBlock,
    })
    const { calldatasParsed } = eventArgs
    const category = getProposalCategoryFromParsedData(calldatasParsed, proposal.description)

    const proposalData = {
      ...proposal,
      votes: {
        againstVotes,
        forVotes,
        abstainVotes,
        quorum: forVotes.add(abstainVotes),
      },
      blocksUntilClosure: deadlineBlock.minus(latestBlockNumber?.toString() || 0),
      votingPeriod: deadlineBlock.minus(creationBlock),
      quorumAtSnapshot: Big(formatEther(BigInt(proposal.quorum ?? 0n))).round(undefined, Big.roundHalfEven),
      proposalDeadline: deadlineBlock,
      proposalState: handleProposalState(proposal, latestBlockNumber ?? 0n),
      category,
      ...eventArgs,
    }

    if (proposalData.proposalState === ProposalState.Active) {
      activeProposals.push(proposalData)
    } else {
      inactiveProposals.push(proposalData)
    }

    return proposalData
  })

  return {
    data: proposalResponse ?? [],
    loading: proposalDataIsLoading,
    error: proposalsDataError,
    inactiveProposals,
    activeProposals,
    activeProposalCount,
    totalProposalCount,
  }
}

function handleProposalState(proposal: ProposalGraphQLResponse, blockNumber?: bigint): ProposalState {
  if (!blockNumber) {
    return proposal.rawState as ProposalState
  }
  if (proposal.rawState != ProposalState.Pending && proposal.rawState != ProposalState.Active) {
    return proposal.rawState as ProposalState
  }
  let block = Big(blockNumber.toString())
  if (Big(proposal.voteStart).gte(block)) {
    return ProposalState.Pending
  }
  if (Big(proposal.voteEnd).gte(block)) {
    return ProposalState.Active
  }
  if (
    Big(proposal.quorum).gt(Big(proposal.votesFor)) ||
    Big(proposal.votesAgainst).gt(Big(proposal.votesFor))
  ) {
    return ProposalState.Defeated
  }
  return ProposalState.Succeeded
}
