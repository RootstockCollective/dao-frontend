'use server'

import { publicClient } from '@/lib/viemPublicClient'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { GovernorAddress, tokenContracts } from '@/lib/contracts'
import { GovernorAbi } from '@/lib/abis/Governor'
import { unstable_cache } from 'next/cache'
import { gql as apolloGQL } from '@apollo/client'
import { daoClient } from '@/shared/components/ApolloClient'

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

const query = apolloGQL`
  query GetProposals {
    proposals(first: 1000, orderDirection: desc, orderBy: createdAt) {
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
      rawState
    }
    counters {
      id
      count
    }
  }
`

export interface GraphQLResponse {
  proposals: ProposalGraphQLResponse[]
  counters: Counter[]
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
  state: string
  rawState: number
}

export interface Counter {
  id: string
  count: string
}

export async function fetchProposals() {
  const { data } = await daoClient.query<GraphQLResponse>({ query, fetchPolicy: 'no-cache' })
  return data
}

export const getCachedProposals = unstable_cache(fetchProposals, ['cached_proposals'], {
  revalidate: 60, // Every 60 seconds
  tags: ['cached_proposals'],
})
