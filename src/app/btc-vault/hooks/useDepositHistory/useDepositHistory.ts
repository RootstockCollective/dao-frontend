'use client'

import { useQuery } from '@tanstack/react-query'

import type { EpochSettledEventDto } from '@/app/api/btc-vault/v1/epoch-history/action'
import { getBtcVaultEpochHistoryEndpoint } from '@/lib/endpoints'

import type { DepositWindowRow, PaginatedResult, PaginationParams } from '../../services/types'
import { buildDepositWindowRows } from './deriveDepositWindows'

function paginate(rows: DepositWindowRow[], params: PaginationParams): PaginatedResult<DepositWindowRow> {
  const sorted = [...rows].sort((a, b) => {
    const dir = params.sortDirection === 'asc' ? 1 : -1
    return dir * (Number(a.epochId) - Number(b.epochId))
  })

  const start = (params.page - 1) * params.limit
  return {
    data: sorted.slice(start, start + params.limit),
    total: rows.length,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(rows.length / params.limit),
  }
}

/**
 * Fetches epoch history from the API route, derives deposit window rows,
 * and returns a paginated result.
 */
export function useDepositHistory(params: PaginationParams) {
  return useQuery({
    queryKey: ['btc-vault', 'deposit-history', params.page, params.limit],
    queryFn: async (): Promise<PaginatedResult<DepositWindowRow>> => {
      const response = await fetch(getBtcVaultEpochHistoryEndpoint)
      if (!response.ok) {
        throw new Error(`Failed to fetch epoch history: ${response.status} ${response.statusText}`)
      }

      const dtos: EpochSettledEventDto[] = await response.json()
      const rows = buildDepositWindowRows(dtos)
      return paginate(rows, params)
    },
    staleTime: Infinity,
  })
}
