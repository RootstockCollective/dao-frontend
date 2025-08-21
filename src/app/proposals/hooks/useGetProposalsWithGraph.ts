import { useMemo } from 'react'
import { useBlockNumber } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import Big from '@/lib/big'
import { ProposalState, ProposalCategory } from '@/shared/types'
import { Proposal } from '../shared/types'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import moment from 'moment'

// Mapping function to convert proposalState string to rawState number
function proposalStateToRawState(proposalState: string): number {
  const stateMap: Record<string, number> = {
    'Pending': ProposalState.Pending,
    'Active': ProposalState.Active,
    'Succeeded': ProposalState.Succeeded,
    'Defeated': ProposalState.Defeated,
    'Executed': ProposalState.Executed,
    'Canceled': ProposalState.Canceled,
    'Queued': ProposalState.Queued,
    'Expired': ProposalState.Expired,
  }
  
  return stateMap[proposalState] || ProposalState.Pending
}

// Mapping function to convert rawState number to proposalState string
function rawStateToProposalState(rawState: number): string {
  const stateMap: Record<number, string> = {
    [ProposalState.Pending]: 'Pending',
    [ProposalState.Active]: 'Active',
    [ProposalState.Succeeded]: 'Succeeded',
    [ProposalState.Defeated]: 'Defeated',
    [ProposalState.Executed]: 'Executed',
    [ProposalState.Canceled]: 'Canceled',
    [ProposalState.Queued]: 'Queued',
    [ProposalState.Expired]: 'Expired',
  }
  
  return stateMap[rawState] || 'Pending'
}

async function fetchProposalsFromAPI(): Promise<ProposalApiResponse[]> {
  console.log('fetching proposals from API')
  const response = await fetch('/api/proposals/v1')
  if (!response.ok) {
    throw new Error(`Failed to fetch proposals: ${response.statusText}`)
  }
  return response.json()
}

export function useGetProposalsWithGraph() {
  const {
    data: proposalsData,
    isLoading: proposalDataIsLoading,
    error: proposalsDataError,
  } = useQuery({
    queryFn: fetchProposalsFromAPI,
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

    return proposalsData
      .filter(
        (proposal: ProposalApiResponse) =>
          handleProposalState(proposal, latestBlockNumber) === ProposalState.Active,
      )
      .length.toString()
  }, [proposalsData, latestBlockNumber])

  const totalProposalCount = useMemo(() => {
    if (!proposalsData) return '0'
    return proposalsData.length.toString()
  }, [proposalsData])

  const activeProposals: Proposal[] = []
  const inactiveProposals: Proposal[] = []

  const proposalResponse = proposalsData?.map((proposal: ProposalApiResponse) => {
    const againstVotes = Big(proposal.votes?.againstVotes || '0')
    const forVotes = Big(proposal.votes?.forVotes || '0')
    const abstainVotes = Big(proposal.votes?.abstainVotes || '0')
    const deadlineBlock = Big(proposal.proposalDeadline || '0')
    
    const blockNumberDecimal = proposal.blockNumber?.startsWith('0x') 
      ? parseInt(proposal.blockNumber, 16).toString()
      : proposal.blockNumber
    
    const proposalData: Proposal = {
      votes: {
        againstVotes,
        forVotes,
        abstainVotes,
        quorum: Big(proposal.quorumAtSnapshot || '0'),
      },
      blocksUntilClosure: proposal.blocksUntilClosure ? Big(proposal.blocksUntilClosure) : Big(0),
      votingPeriod: Big(proposal.votingPeriod || '0'),
      quorumAtSnapshot: proposal.quorumAtSnapshot ? Big(proposal.quorumAtSnapshot) : Big(0),
      proposalDeadline: deadlineBlock,
      proposalState: handleProposalState(proposal, latestBlockNumber ?? 0n),
      category: proposal.category as ProposalCategory,
      name: proposal.name,
      proposer: proposal.proposer,
      description: proposal.description,
      proposalId: proposal.proposalId,
      Starts: moment(proposal.Starts),
      calldatasParsed: proposal.calldatasParsed as any,
      blockNumber: blockNumberDecimal,
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

function handleProposalState(proposal: ProposalApiResponse, blockNumber?: bigint): ProposalState {
  if (!blockNumber) {
    // Convert proposalState string to rawState number using the mapping
    const rawState = proposalStateToRawState(proposal.proposalState || 'Pending')
    return rawState as ProposalState
  }

  if (!proposal.votes) {
    return ProposalState.Pending
  }
  
  // If we have a proposalState from the API, convert it to rawState for comparison
  const currentRawState = proposalStateToRawState(proposal.proposalState || 'Pending')
  
  if (currentRawState != ProposalState.Pending && currentRawState != ProposalState.Active) {
    return currentRawState as ProposalState
  }
  let block = Big(blockNumber.toString())
  if (Big(proposal.voteStart).gte(block)) {
    return ProposalState.Pending
  }
  if (Big(proposal.voteEnd).gte(block)) {
    return ProposalState.Active
  }
  if (
    Big(proposal.quorumAtSnapshot ?? '0').gt(Big(proposal.votes.forVotes)) ||
    Big(proposal.votes.againstVotes).gt(Big(proposal.votes.forVotes))
  ) {
    return ProposalState.Defeated
  }
  return ProposalState.Succeeded
}
