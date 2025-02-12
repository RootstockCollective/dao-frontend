import { governor } from '@/lib/contracts'
import { useQuery } from '@tanstack/react-query'
import { Address, Log, parseEventLogs } from 'viem'
import { fetchVoteCastByAddress } from '../api/events'

const parseVoteCastEvents = (address: Address) => async () => {
  const logs = await fetchVoteCastByAddress(address)

  const events = parseEventLogs({
    abi: governor.abi,
    logs: logs as unknown as Log[], // @TODO refine this
    eventName: 'VoteCast',
  })

  return events
}

export const useVoteCastEvent = (address: Address) => {
  return useQuery({
    queryFn: parseVoteCastEvents(address),
    queryKey: ['VoteCast'],
  })
}
