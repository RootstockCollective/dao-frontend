import { governor } from '@/lib/contracts'
import { useQuery } from '@tanstack/react-query'
import { Address, parseEventLogs } from 'viem'
import { fetchVoteCastByAddress } from '../api/events'

const parseVoteCastEvents = (address: Address, latestBlockNumber?: bigint) => async () => {
  const logs = await fetchVoteCastByAddress(address, latestBlockNumber)

  const events = parseEventLogs({
    abi: governor.abi,
    logs,
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
