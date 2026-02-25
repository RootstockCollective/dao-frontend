import { useQuery } from '@tanstack/react-query'
import { useMockBtcVaultAdapter } from '../../providers/MockBtcVaultProvider'
import { toActiveRequestDisplay } from '../../services/ui/mappers'

/**
 * Fetches the user's active vault requests, enriching claimable ones with locked share price info.
 * Query is disabled when address is undefined.
 * @param address - User's wallet address, or undefined if not connected
 * @returns React Query result containing an array of {@link ActiveRequestDisplay}
 */
export function useActiveRequestsMock(address: string | undefined) {
  const adapter = useMockBtcVaultAdapter()

  return useQuery({
    queryKey: ['btc-vault', 'active-requests', address],
    queryFn: async () => {
      const requests = await adapter.getActiveRequests(address!)
      return Promise.all(
        requests.map(async req => {
          const claimableInfo = req.status === 'claimable' ? await adapter.getClaimableStatus(req.id) : null
          return toActiveRequestDisplay(req, claimableInfo)
        }),
      )
    },
    enabled: !!address,
  })
}
