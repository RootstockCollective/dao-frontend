import { useQuery } from '@tanstack/react-query'
import { Address, parseEventLogs } from 'viem'
import { useBlockNumber } from 'wagmi'
import { fetchNewAllocationEventByAddress } from '../api/events'
import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'

const NEW_ALLOCATION = 'NewAllocation'

export const useNewAllocationEvent = (address: Address) => {
  const { data: latestBlockNumber } = useBlockNumber()

  return useQuery({
    queryFn: async () => {
      const logs = await fetchNewAllocationEventByAddress(address, latestBlockNumber!)

      const events = parseEventLogs({
        abi: BackersManagerAbi,
        logs,
        eventName: NEW_ALLOCATION,
      })

      return events
    },
    queryKey: [NEW_ALLOCATION],
  })
}
