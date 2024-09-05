import { fetchProposalsCreatedCached } from '@/app/user/Balances/actions'
import { GovernorAbi } from '@/lib/abis/Governor'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { parseEventLogs } from 'viem'

export const useFetchLatestProposals = () => {
  const { data, isLoading } = useQuery({
    queryFn: fetchProposalsCreatedCached,
    queryKey: ['proposalsCreated'],
    staleTime: 60000,
    retry: 10,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })

  const latestProposals = useMemo(() => {
    if (data?.data) {
      const proposals = parseEventLogs({
        abi: GovernorAbi,
        logs: data.data,
        eventName: 'ProposalCreated',
      })

      // remove duplicates
      return (
        proposals
          .filter(
            (proposal, index, self) =>
              self.findIndex(p => p.args.proposalId === proposal.args.proposalId) === index,
          )
          // @ts-ignore
          .sort((a, b) => b.timeStamp - a.timeStamp)
      )
    }
    return []
  }, [data])

  return { latestProposals, isLoading }
}
