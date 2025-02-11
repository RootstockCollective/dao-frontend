import { governor } from '@/lib/contracts'
import { useQuery } from '@tanstack/react-query'
import { Address, parseEventLogs } from 'viem'
import { useBlockNumber } from 'wagmi'
import { fetchVoteCastByAddress } from '../api/events'

export const useVoteCastEvent = (address: Address) => {
  const { data: latestBlockNumber } = useBlockNumber()

  return useQuery({
    queryFn: async () => {
      const logs = await fetchVoteCastByAddress(address, latestBlockNumber!)

      const events = parseEventLogs({
        abi: governor.abi,
        logs,
        eventName: 'VoteCast',
      })

      return events
    },
    queryKey: ['VoteCast'],
  })
}
