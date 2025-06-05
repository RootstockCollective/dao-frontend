import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { handleProposalState } from '@/lib/utils'
import { GET_PROPOSALS, GraphQLResponse, ProposalGraphQLResponse } from '@/lib/graphql/queries/getProposals'
import { useBlockNumber } from 'wagmi'

export function useGetProposals() {
  const { data, loading, error } = useQuery<GraphQLResponse['data']>(GET_PROPOSALS, {
    pollInterval: 60000,
  })
  const { data: lastBlockNumber } = useBlockNumber()

  const activeProposals = useMemo(() => {
    if (!data || !lastBlockNumber) return '0'
    return data.proposals
      .filter(
        (proposal: ProposalGraphQLResponse) => handleProposalState(proposal, lastBlockNumber) === 'Active',
      )
      .length.toString()
  }, [data, lastBlockNumber])

  const totalProposals = useMemo(() => {
    if (!data) return '0'
    return data.counters.find(e => e.id === 'proposals')?.count || '0'
  }, [data])

  return { data, loading, error, activeProposals, totalProposals }
}
