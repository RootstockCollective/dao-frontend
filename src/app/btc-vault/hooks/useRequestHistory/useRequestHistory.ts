import { useQuery } from '@tanstack/react-query'

import type { PaginationParams } from '../../services/types'
import { toPaginatedHistoryDisplay } from '../../services/ui/mappers'
import { MOCK_REQUESTS, paginate } from '../mock-data'

export function useRequestHistory(address: string | undefined, params: PaginationParams) {
  return useQuery({
    queryKey: ['btc-vault', 'history', address, params],
    queryFn: () => toPaginatedHistoryDisplay(paginate(MOCK_REQUESTS, params)),
    enabled: !!address,
    staleTime: Infinity,
  })
}
