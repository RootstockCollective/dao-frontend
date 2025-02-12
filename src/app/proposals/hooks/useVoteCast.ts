import { governor } from '@/lib/contracts'
import { useQuery } from '@tanstack/react-query'
import { Address, Log, parseEventLogs } from 'viem'
import { fetchVoteCastEventByAccountAddress } from '@/app/user/Balances/actions'

const parseVoteCastEvents = (address: Address) => async () => {
  try {
    const { data: logs } = await fetchVoteCastEventByAccountAddress(address)

    const events = parseEventLogs({
      abi: governor.abi,
      logs: logs as unknown as Log[], // @TODO refine this
      eventName: 'VoteCast',
    })

    return events
  } catch (err) {
    console.log('ERROR in parseVoteCastEvents', err)
  }
}

export const useVoteCastEvent = (address: Address) => {
  return useQuery({
    queryFn: parseVoteCastEvents(address),
    queryKey: ['VoteCast'],
  })
}
