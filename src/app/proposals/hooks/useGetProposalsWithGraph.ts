import { useMemo } from 'react'
import { useBlockNumber } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { useReadContracts } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import Big from '@/lib/big'
import { ProposalState } from '@/shared/types'
import { Proposal } from '../shared/types'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import moment from 'moment'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GOVERNOR_ADDRESS } from '@/lib/constants'
import { formatEther, Address } from 'viem'

function toProposalState(value: number | string | undefined): ProposalState {
  if (typeof value === 'number') {
    // Validate that the number is a valid ProposalState enum value
    if (value >= 0 && value <= 7) {
      return value as ProposalState
    }
  }
  if (typeof value === 'string') {
    const stateMap: Record<string, ProposalState> = {
      Pending: ProposalState.Pending,
      Active: ProposalState.Active,
      Succeeded: ProposalState.Succeeded,
      Defeated: ProposalState.Defeated,
      Executed: ProposalState.Executed,
      Canceled: ProposalState.Canceled,
      Queued: ProposalState.Queued,
      Expired: ProposalState.Expired,
    }
    return stateMap[value] || ProposalState.Pending
  }
  return ProposalState.Pending
}

function proposalStateToRawState(proposalState: string): number {
  return toProposalState(proposalState)
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

interface BlockchainProposalData {
  proposalId: string
  votes: {
    againstVotes: Big
    forVotes: Big
    abstainVotes: Big
  }
  quorum: Big
  rawState: ProposalState
}

interface ProposalVotesContract {
  address: Address
  abi: typeof GovernorAbi
  functionName: 'proposalVotes'
  args: [string]
}

interface QuorumContract {
  address: Address
  abi: typeof GovernorAbi
  functionName: 'quorum'
  args: [string]
}

interface StateContract {
  address: Address
  abi: typeof GovernorAbi
  functionName: 'state'
  args: [string]
}

function transformProposalsData(
  proposalsData: ProposalApiResponse[] | undefined,
  blockchainData: BlockchainProposalData[] | undefined,
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

    // Convert blockchain votes (Big) to API format (string) if needed
    const votes: ProposalApiResponse['votes'] | undefined = proposal.votes
      ? proposal.votes
      : blockchainInfo?.votes
        ? {
            againstVotes: blockchainInfo.votes.againstVotes.toString(),
            forVotes: blockchainInfo.votes.forVotes.toString(),
            abstainVotes: blockchainInfo.votes.abstainVotes.toString(),
          }
        : undefined

    const quorum = proposal.quorumAtSnapshot || blockchainInfo?.quorum?.toString()
    const rawState = blockchainInfo?.rawState

    const voteData = convertVotesToBigNumbers(votes)
    const deadlineBlock = Big(proposal.proposalDeadline || '0')
    const blockNumber = parseBlockNumber(proposal.blockNumber)

    const proposalData: Proposal = {
      votes: {
        ...voteData,
        quorumReached: voteData.forVotes.add(voteData.abstainVotes),
      },
      blocksUntilClosure: Big(proposal.proposalDeadline).minus(Big(latestBlockNumber?.toString() || '0')),
      votingPeriod: Big(proposal.votingPeriod || '0'),
      quorumAtSnapshot: Big(quorum ?? blockchainInfo?.quorum?.toString() ?? '0'),
      proposalDeadline: deadlineBlock,
      proposalState: handleProposalState(proposal, latestBlockNumber ?? 0n, rawState),
      category: proposal.category,
      name: proposal.name,
      proposer: proposal.proposer,
      description: proposal.description,
      proposalId: proposal.proposalId,
      Starts: moment(proposal.Starts),
      calldatasParsed: proposal.calldatasParsed,
      blockNumber,
      voteStart: proposal.voteStart,
      voteEnd: proposal.voteEnd,
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
    const initialValue: {
      votesContracts: ProposalVotesContract[]
      quorumContracts: QuorumContract[]
      stateContracts: StateContract[]
    } = {
      votesContracts: [],
      quorumContracts: [],
      stateContracts: [],
    }
    return proposalsFromNode.reduce((acc, proposal) => {
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
    }, initialValue)
  }, [proposalsFromNode])

  const proposalVotesResult = useReadContracts({
    contracts: votesContracts,
    query: {
      enabled: proposalsFromNode.length > 0,
      staleTime: AVERAGE_BLOCKTIME,
    },
  })

  const quorumResult = useReadContracts({
    contracts: quorumContracts,
    query: {
      enabled: proposalsFromNode.length > 0,
      staleTime: 24 * 60 * 60 * 1000,
    },
  })

  const stateResult = useReadContracts({
    contracts: stateContracts,
    query: {
      enabled: proposalsFromNode.length > 0,
      staleTime: AVERAGE_BLOCKTIME,
    },
  })

  const proposalVotes = proposalVotesResult.data
  const quorum = quorumResult.data
  const state = stateResult.data

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
        rawState: toProposalState(proposalState),
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
  if (rawState !== undefined) {
    return toProposalState(rawState)
  }
  const proposalState = proposalStateToRawState(proposal.proposalState || 'Pending')
  if (!blockNumber) {
    return proposalState
  }

  if (proposalState != ProposalState.Pending && proposalState != ProposalState.Active) {
    return proposalState
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
