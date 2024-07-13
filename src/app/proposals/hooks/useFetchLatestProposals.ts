import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { parseEventLogs } from 'viem'
import { GovernorAbi } from '@/lib/abis/Governor'
import { fetchProposalCreated } from '@/app/user/Balances/actions'

export const useFetchLatestProposals = () => {
  const query = useQuery({
    queryFn: fetchProposalCreated,
    queryKey: ['proposalsCreated'],
  })

  const latestProposals = useMemo(() => {
    if (query.data?.data) {
      return parseEventLogs({
        abi: GovernorAbi,
        logs: query.data.data,
        eventName: 'ProposalCreated',
      })
    }
    return []
  }, [query.data])

  return { latestProposals }
}
