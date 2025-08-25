import { useMemo } from 'react'
import { useBlockNumber } from 'wagmi'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useReadContracts } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import Big from '@/lib/big'
import { ProposalState, ProposalCategory } from '@/shared/types'
import { Proposal } from '../shared/types'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import moment from 'moment'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GOVERNOR_ADDRESS } from '@/lib/constants'
import { formatEther } from 'viem'

function proposalStateToRawState(proposalState: string): number {
  const stateMap: Record<string, number> = {
    Pending: ProposalState.Pending,
    Active: ProposalState.Active,
    Succeeded: ProposalState.Succeeded,
    Defeated: ProposalState.Defeated,
    Executed: ProposalState.Executed,
    Canceled: ProposalState.Canceled,
    Queued: ProposalState.Queued,
    Expired: ProposalState.Expired,
  }

  return stateMap[proposalState] || ProposalState.Pending
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

  const proposalsFromNode = useMemo(
    () =>
      proposalsData?.filter(
        proposal => !proposal.votes || !proposal.proposalState || !proposal.quorumAtSnapshot,
      ) || [],
    [proposalsData],
  )

  const { data: proposalVotes } = useReadContracts({
    contracts:
      proposalsFromNode.map(proposal => ({
        address: GOVERNOR_ADDRESS,
        abi: GovernorAbi,
        functionName: 'proposalVotes',
        args: [proposal.proposalId],
      })) || [],
    query: {
      enabled: proposalsFromNode.length > 0,
      staleTime: AVERAGE_BLOCKTIME,
    },
  }) as { data?: Array<{ status: string; result: bigint[] }> }

  // @ts-ignore - Suppress "Type instantiation is excessively deep" error

  const { data: quorum } = useReadContracts({
    contracts:
      proposalsFromNode.map(proposal => ({
        address: GOVERNOR_ADDRESS,
        abi: GovernorAbi,
        functionName: 'quorum',
        args: [proposal.blockNumber],
      })) || [],
    query: {
      enabled: proposalsFromNode.length > 0,
      staleTime: 24 * 60 * 60 * 1000,
    },
  }) as { data?: Array<{ status: string; result: bigint }> }

  const { data: state } = useReadContracts({
    contracts:
      proposalsFromNode.map(proposal => ({
        address: GOVERNOR_ADDRESS,
        abi: GovernorAbi,
        functionName: 'state',
        args: [proposal.proposalId],
      })) || [],
    query: {
      enabled: proposalsFromNode.length > 0,
      staleTime: AVERAGE_BLOCKTIME,
    },
  }) as { data?: Array<{ status: string; result: bigint }> }

  const blockchainData = useMemo(() => {
    if (!proposalVotes || !quorum || !state || !proposalsFromNode) return []

    return proposalsFromNode.map((proposal, index) => {
      const votes = proposalVotes?.[index]?.result?.map(vote => Big(formatEther(vote)).round())
      const againstVotes = Big(votes?.at(0) ?? 0)
      const forVotes = Big(votes?.at(1) ?? 0)
      const abstainVotes = Big(votes?.at(2) ?? 0)

      return {
        proposalId: proposal.proposalId,
        votes: {
          againstVotes,
          forVotes,
          abstainVotes,
        },
        quorum: Big(formatEther(quorum[index].result).toString()).round(undefined, Big.roundHalfEven),
        rawState: Big(state?.[index].result?.toString() ?? 0).toNumber() as ProposalState,
      }
    })
  }, [proposalVotes, quorum, state, proposalsFromNode])

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
    const blockchainInfo = blockchainData?.find(b => b.proposalId === proposal.proposalId)

    const votes = proposal.votes || blockchainInfo?.votes
    const quorum = proposal.quorumAtSnapshot || blockchainInfo?.quorum
    const rawState = blockchainInfo?.rawState

    const againstVotes = Big(votes?.againstVotes || '0')
    const forVotes = Big(votes?.forVotes || '0')
    const abstainVotes = Big(votes?.abstainVotes || '0')
    const deadlineBlock = Big(proposal.proposalDeadline || '0')

    const blockNumberDecimal = proposal.blockNumber?.startsWith('0x')
      ? parseInt(proposal.blockNumber, 16).toString()
      : proposal.blockNumber

    const proposalData: Proposal = {
      votes: {
        againstVotes,
        forVotes,
        abstainVotes,
        quorum: Big(quorum || '0'),
      },
      blocksUntilClosure: Big(proposal.proposalDeadline).minus(Big(latestBlockNumber?.toString() || '')),
      votingPeriod: Big(proposal.votingPeriod || '0'),
      quorumAtSnapshot: Big(quorum || '0'),
      proposalDeadline: deadlineBlock,
      proposalState: handleProposalState(proposal, latestBlockNumber ?? 0n, rawState),
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

function handleProposalState(
  proposal: ProposalApiResponse,
  blockNumber?: bigint,
  rawState?: number,
): ProposalState {
  if (rawState) {
    return rawState as ProposalState
  }
  if (!blockNumber) {
    return proposalStateToRawState(proposal.proposalState || 'Pending')
  }

  if (!proposal.votes || !proposal.quorumAtSnapshot) {
    return ProposalState.Pending
  }

  let block = Big(blockNumber.toString())
  if (Big(proposal.voteStart).gte(block)) {
    return ProposalState.Pending
  }
  if (Big(proposal.voteEnd).gte(block)) {
    return ProposalState.Active
  }
  if (
    Big(proposal.quorumAtSnapshot).gt(Big(proposal.votes.forVotes)) ||
    Big(proposal.votes.againstVotes).gt(Big(proposal.votes.forVotes))
  ) {
    return ProposalState.Defeated
  }
  return ProposalState.Succeeded
}
