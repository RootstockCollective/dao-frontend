import { useQuery } from '@tanstack/react-query'

import { MOCK_REQUESTS } from '../mock-data'

/**
 * Returns a single VaultRequest by ID from mock data.
 * Returns null when no request matches the given ID.
 */
export function useRequestById(id: string | undefined) {
  return useQuery({
    queryKey: ['btc-vault', 'request', id],
    queryFn: () => MOCK_REQUESTS.find(r => r.id === id) ?? null,
    enabled: !!id,
    staleTime: Infinity,
  })
}
