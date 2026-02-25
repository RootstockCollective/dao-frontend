import { useQuery } from '@tanstack/react-query'
import { useMockBtcVaultAdapter } from '../../providers/MockBtcVaultProvider'
import { toPaginatedHistoryDisplay } from '../../services/ui/mappers'
import type { PaginationParams } from '../../services/types'

/**
 * Fetches paginated request history for a user with display-formatted rows.
 * Query is disabled when address is undefined.
 * @param address - User's wallet address, or undefined if not connected
 * @param params - Pagination parameters (page, limit)
 * @returns React Query result containing {@link PaginatedHistoryDisplay}
 */
export function useRequestHistoryMock(address: string | undefined, params: PaginationParams) {
  const adapter = useMockBtcVaultAdapter()

  return useQuery({
    queryKey: ['btc-vault', 'history', address, params],
    queryFn: async () => {
      const raw = await adapter.getRequestHistory(address!, params)
      return toPaginatedHistoryDisplay(raw)
    },
    enabled: !!address,
  })
}
