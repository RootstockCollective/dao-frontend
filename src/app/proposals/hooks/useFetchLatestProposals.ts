import { GovernorAddress } from '@/lib/contracts'
import { useMemo } from 'react'
import { axiosInstance } from '@/lib/utils'
import { fetchProposalsCreatedByGovernorAddress } from '@/lib/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseEventLogs } from 'viem'
import { GovernorAbi } from '@/lib/abis/Governor'

const fetchProposalCreated = () =>
  axiosInstance.get(fetchProposalsCreatedByGovernorAddress.replace('{{address}}', GovernorAddress))

interface EventArgumentsParameter {
  args: {
    description: string
    proposalId: bigint
    voteStart: bigint
    voteEnd: bigint
    proposer: string
  }
  timeStamp: string
}
const getEventArguments = ({
  args: { description, proposalId, proposer },
  timeStamp,
}: EventArgumentsParameter) => ({
  name: description.split(';')[0],
  proposer,
  description: description.split(';')[1],
  proposalId: proposalId.toString(),
  Starts: new Date(parseInt(timeStamp, 16) * 1000).toISOString().split('T')[0],
  Sentiment: '',
})

export const useFetchLatestProposals = () => {
  const query = useQuery({
    queryFn: fetchProposalCreated,
    queryKey: ['proposalsCreated'],
  })

  const latestProposals = useMemo(() => {
    if (query.data?.data) {
      const eventsParsed = parseEventLogs({
        abi: GovernorAbi,
        logs: query.data.data,
        eventName: 'ProposalCreated',
      })
      console.log(40, eventsParsed)
      // @ts-ignore
      return eventsParsed.map(getEventArguments)
    }
    return []
  }, [query.data])

  return { latestProposals }
}
