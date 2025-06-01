'use server'

import { publicClient } from '@/lib/viemPublicClient'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { GovernorAddress, tokenContracts } from '@/lib/contracts'
import { GovernorAbi } from '@/lib/abis/Governor'
import { unstable_cache } from 'next/cache'

const fetchProposalSharedDetails = async () => {
  // Proposal Threshold (from governor)
  // StRIF Decimals

  const data = await publicClient.multicall({
    contracts: [
      {
        abi: StRIFTokenAbi,
        address: tokenContracts.stRIF,
        functionName: 'decimals',
      },
      { abi: GovernorAbi, address: GovernorAddress, functionName: 'proposalThreshold' },
    ],
  })
  if (data[0].status !== 'success' || data[1].status !== 'success') {
    throw new Error('Failed to fetch proposal shared details')
  }

  return {
    stRIFDecimals: data[0].result,
    proposalThreshold: data[1].result.toString(),
  }
}

export const getCachedProposalSharedDetails = unstable_cache(fetchProposalSharedDetails, undefined, {
  revalidate: 3600, // 1 hour in seconds
})

//(studio = test env with a limit of 2 request per minute, gateway = deployed graph)
const GRAPH_URl = `${process.env.DAO_GRAPH_URL}/${process.env.DAO_GRAPH_API_KEY}/${process.env.DAO_GRAPH_ID}`

const queryProposals = `{
    proposals(first:1000, orderDirection: desc, orderBy: createdAt) {
      id
      proposalId
      proposer {
        id
      }
      targets
      description
      votesFor
      votesAgainst
      votesAbstains
      voteEnd
      voteStart
      quorum
      createdAt
      createdAtBlock
      description
      signatures
      values
      calldatas
      state
    },
    counters {
      id
      count
    }
  }`

// Types for the GraphQL response
interface GraphQLResponse {
  data: {
    proposals: ProposalGraphQLResponse[]
    counters: Counter[]
  }
}

export interface ProposalGraphQLResponse {
  id: string
  proposalId: string
  proposer: {
    id: string
  }
  targets: string[]
  description: string
  votesFor: string
  votesAgainst: string
  votesAbstains: string
  voteEnd: string
  voteStart: string
  quorum: string
  createdAt: string
  createdAtBlock: string
  signatures: string[]
  values: string[]
  calldatas: string[]
  state: ProposalState
}

type ProposalState =
  | 'Pending'
  | 'Active'
  | 'Canceled'
  | 'Defeated'
  | 'Succeeded'
  | 'Queued'
  | 'Expired'
  | 'Executed'

interface Counter {
  id: string
  count: string
}

const fetchProposalsFromGraph = async (): Promise<GraphQLResponse['data']> => {
  const res = await fetch(GRAPH_URl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: queryProposals,
      variables: {},
    }),
  })
  if (!res.ok) {
    throw new Error('Failed to fetch proposals')
  }
  const { data }: { data: GraphQLResponse['data'] } = await res.json()
  return data
}

export const fetchCachedProposalsFromGraph = unstable_cache(fetchProposalsFromGraph, undefined, {
  revalidate: 60,
})

export async function getBlockNumber() {
  return publicClient.getBlockNumber()
}
