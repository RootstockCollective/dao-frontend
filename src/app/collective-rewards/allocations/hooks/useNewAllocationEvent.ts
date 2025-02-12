import { useQuery } from '@tanstack/react-query'
import { Address, Log, parseEventLogs } from 'viem'
import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { fetchNewAllocationEventByAccountAddress } from '@/app/user/Balances/actions'

const NEW_ALLOCATION = 'NewAllocation'

export const parseNewAllocationEvent = (address: Address) => async () => {
  const { data } = await fetchNewAllocationEventByAccountAddress(address)

  const events = parseEventLogs({
    abi: BackersManagerAbi,
    logs: data as unknown as Log[], //TODO: refine this
    eventName: NEW_ALLOCATION,
  })

  return events
}

export const useNewAllocationEvent = (address: Address) => {
  return useQuery({
    queryFn: parseNewAllocationEvent(address),
    queryKey: [NEW_ALLOCATION],
  })
}
