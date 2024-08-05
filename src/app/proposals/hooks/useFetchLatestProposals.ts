import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { parseEventLogs } from 'viem'
import { GovernorAbi } from '@/lib/abis/Governor'
import { fetchProposalsCreatedCached } from '@/app/user/Balances/actions'

export const useFetchLatestProposals = () => {
  const { data } = useQuery({
    queryFn: fetchProposalsCreatedCached,
    queryKey: ['proposalsCreated'],
    refetchInterval: 2000,
  })

  const latestProposals = useMemo(() => {
    if (data?.data) {
      const proposals = parseEventLogs({
        abi: GovernorAbi,
        logs: data.data,
        eventName: 'ProposalCreated',
      })

      // remove duplicates
      return proposals.filter(
        (proposal, index, self) =>
          self.findIndex(p => p.args.proposalId === proposal.args.proposalId) === index,
      )
    }
    return []
  }, [data])

  return { latestProposals }
}
