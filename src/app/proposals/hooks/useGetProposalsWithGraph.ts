import { useMemo } from 'react'
import { useBlockNumber } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
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
  const response = await fetch('/api/proposals/v1')
  if (!response.ok) {
    throw new Error(`Failed to fetch proposals: ${response.statusText}`)
  }
  return response.json()
}

function convertVotesToBigNumbers(votes: ProposalApiResponse['votes']) {
  const againstVotes = Big(votes?.againstVotes || '0')
  const forVotes = Big(votes?.forVotes || '0')
  const abstainVotes = Big(votes?.abstainVotes || '0')

  return {
    againstVotes,
    forVotes,
    abstainVotes,
  }
}

function parseBlockNumber(blockNumber: string | undefined): string {
  if (!blockNumber) return ''
  return blockNumber.startsWith('0x') ? parseInt(blockNumber, 16).toString() : blockNumber
}

function transformProposalsData(
  proposalsData: ProposalApiResponse[] | undefined,
  blockchainData: any[] | undefined,
  latestBlockNumber: bigint | undefined,
) {
  if (!proposalsData) {
    return {
      transformedProposals: [],
      activeProposals: [],
      inactiveProposals: [],
    }
  }

  const activeProposals: Proposal[] = []
  const inactiveProposals: Proposal[] = []

  const transformedProposals = proposalsData.map((proposal: ProposalApiResponse) => {
    const blockchainInfo = blockchainData?.find(b => b.proposalId === proposal.proposalId)

    const votes = proposal.votes || blockchainInfo?.votes
    const quorum = proposal.quorumAtSnapshot || blockchainInfo?.quorum
    const rawState = blockchainInfo?.rawState

    const voteData = convertVotesToBigNumbers(votes)
    const deadlineBlock = Big(proposal.proposalDeadline || '0')
    const blockNumber = parseBlockNumber(proposal.blockNumber)

    const proposalData: Proposal = {
      votes: {
        ...voteData,
        quorum: Big(quorum || '0'),
      },
      blocksUntilClosure: Big(proposal.proposalDeadline).minus(Big(latestBlockNumber?.toString() || '0')),
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
      blockNumber,
    }

    if (proposalData.proposalState === ProposalState.Active) {
      activeProposals.push(proposalData)
    } else {
      inactiveProposals.push(proposalData)
    }

    return proposalData
  })

  return {
    transformedProposals,
    activeProposals,
    inactiveProposals,
  }
}

export function useGetProposalsWithGraph() {
  const { data: latestBlockNumber } = useBlockNumber({
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      staleTime: AVERAGE_BLOCKTIME,
    },
  })

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

  const { votesContracts, quorumContracts, stateContracts } = useMemo(() => {
    return proposalsFromNode.reduce(
      (acc, proposal) => {
        acc.votesContracts.push({
          address: GOVERNOR_ADDRESS,
          abi: GovernorAbi,
          functionName: 'proposalVotes',
          args: [proposal.proposalId],
        })

        acc.quorumContracts.push({
          address: GOVERNOR_ADDRESS,
          abi: GovernorAbi,
          functionName: 'quorum',
          args: [proposal.blockNumber],
        })

        acc.stateContracts.push({
          address: GOVERNOR_ADDRESS,
          abi: GovernorAbi,
          functionName: 'state',
          args: [proposal.proposalId],
        })

        return acc
      },
      {
        votesContracts: [] as any[],
        quorumContracts: [] as any[],
        stateContracts: [] as any[],
      },
    )
  }, [proposalsFromNode])

  const { data: proposalVotes } = useReadContracts({
    contracts: votesContracts,
    query: {
      enabled: proposalsFromNode.length > 0,
      staleTime: AVERAGE_BLOCKTIME,
    },
  }) as { data?: Array<{ status: string; result: bigint[] }> }

  const { data: quorum } = useReadContracts({
    contracts: quorumContracts,
    query: {
      enabled: proposalsFromNode.length > 0,
      staleTime: 24 * 60 * 60 * 1000,
    },
  }) as { data?: Array<{ status: string; result: bigint }> }

  const { data: state } = useReadContracts({
    contracts: stateContracts,
    query: {
      enabled: proposalsFromNode.length > 0,
      staleTime: AVERAGE_BLOCKTIME,
    },
  }) as { data?: Array<{ status: string; result: bigint }> }

  const blockchainData = useMemo(() => {
    if (!proposalsFromNode) return []

    return proposalsFromNode.map((proposal, index) => {
      const votes = proposalVotes?.[index]?.result?.map(vote => Big(formatEther(vote)).round())
      const againstVotes = Big(votes?.at(0) ?? 0)
      const forVotes = Big(votes?.at(1) ?? 0)
      const abstainVotes = Big(votes?.at(2) ?? 0)

      const quorumValue = quorum?.[index]?.result
        ? Big(formatEther(quorum[index].result).toString()).round(undefined, Big.roundHalfEven)
        : Big(0)

      const proposalState = state?.[index]?.result ?? 0

      return {
        proposalId: proposal.proposalId,
        votes: {
          againstVotes,
          forVotes,
          abstainVotes,
        },
        quorum: quorumValue,
        rawState: Big(proposalState.toString()).toNumber() as ProposalState,
      }
    })
  }, [proposalVotes, quorum, state, proposalsFromNode])

  const { transformedProposals, activeProposals, inactiveProposals } = useMemo(
    () => transformProposalsData(proposalsData, blockchainData, latestBlockNumber),
    [proposalsData, blockchainData, latestBlockNumber],
  )

  return {
    data: transformedProposals ?? [],
    loading: proposalDataIsLoading,
    error: proposalsDataError,
    inactiveProposals,
    activeProposals,
    activeProposalCount: activeProposals.length.toString(),
    totalProposalCount: transformedProposals.length.toString(),
  }
}

function handleProposalState(
  proposal: ProposalApiResponse,
  blockNumber?: bigint,
  rawState?: number,
): ProposalState {
  if (proposal.proposalId === '93114685443285925243283394517435877751023305600815989070198792396783407351507')
    console.log('proposal', { proposal, blockNumber, rawState })
  if (rawState) {
    return rawState as ProposalState
  }
  const proposalState = proposalStateToRawState(proposal.proposalState || 'Pending')
  if (!blockNumber) {
    return proposalState as ProposalState
  }

  if (proposalState != ProposalState.Pending && proposalState != ProposalState.Active) {
    return proposalState as ProposalState
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
