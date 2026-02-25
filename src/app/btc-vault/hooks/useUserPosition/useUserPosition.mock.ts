import { useQuery } from '@tanstack/react-query'
import { useMockBtcVaultAdapter } from '../../providers/MockBtcVaultProvider'
import { toUserPositionDisplay } from '../../services/ui/mappers'

/**
 * Fetches the user's vault position and returns display-formatted balances.
 * Query is disabled when address is undefined.
 * @param address - User's wallet address, or undefined if not connected
 * @returns React Query result containing {@link UserPositionDisplay}
 */
export function useUserPositionMock(address: string | undefined) {
  const adapter = useMockBtcVaultAdapter()

  return useQuery({
    queryKey: ['btc-vault', 'user-position', address],
    queryFn: async () => {
      const raw = await adapter.getUserPosition(address!)
      return toUserPositionDisplay(raw)
    },
    enabled: !!address,
  })
}
