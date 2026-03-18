import { useQuery } from '@tanstack/react-query'

import type { VaultRequest } from '../../services/types'
import type { BtcVaultHistoryApiResponse } from '../../services/ui/api-types'
import { mapApiItemToVaultRequest } from '../../services/ui/mappers'

const HISTORY_API_PATH = '/api/btc-vault/v1/history'
const REQUEST_BY_ID_LIMIT = 200

/**
 * Fetches a single vault request by id from the history API.
 * Calls GET /api/btc-vault/v1/history with the user's address, then finds the item by id.
 * Query is disabled when id or address is undefined.
 *
 * @param id - Request id (e.g. from route params)
 * @param address - Connected wallet address; required to fetch user's history
 * @returns React Query result with data: VaultRequest | null (null if not found in first page)
 */
export function useRequestById(id: string | undefined, address: string | undefined) {
  return useQuery({
    queryKey: ['btc-vault', 'request', id, address],
    queryFn: async (): Promise<VaultRequest | null> => {
      if (!id || !address) throw new Error('id and address are required')
      const params = new URLSearchParams({
        address,
        page: '1',
        limit: String(REQUEST_BY_ID_LIMIT),
        sort_field: 'timestamp',
        sort_direction: 'desc',
      })
      const res = await fetch(`${HISTORY_API_PATH}?${params.toString()}`)
      if (!res.ok) throw new Error(`History API error: ${res.status}`)
      const response = (await res.json()) as BtcVaultHistoryApiResponse
      const item = response.data.find(d => d.id === id)
      if (!item) return null
      return mapApiItemToVaultRequest(item)
    },
    enabled: !!id && !!address,
    staleTime: Infinity,
  })
}
