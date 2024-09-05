import { fetchProposalsCreatedCached } from '@/app/user/Balances/actions'
import { GovernorAbi } from '@/lib/abis/Governor'
import { useQuery } from '@tanstack/react-query'
import { parseEventLogs } from 'viem'

export const useFetchLatestProposals = () => {
  const { data, isLoading } = useQuery({
    queryFn: fetchProposalsCreatedCached,
    queryKey: ['proposalsCreated'],
    staleTime: 60000 * 5, // keep the cache for 5 minutes before mark is as stale
    retry: 10,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    select: ({ data }) =>
      parseEventLogs({
        abi: GovernorAbi,
        logs: data,
        eventName: 'ProposalCreated',
      })
        .filter(
          (proposal, index, self) =>
            self.findIndex(p => p.args.proposalId === proposal.args.proposalId) === index,
        )
        // @ts-ignore
        .sort((a, b) => b.timeStamp - a.timeStamp),
  })

  return { latestProposals: data || [], isLoading }
}
