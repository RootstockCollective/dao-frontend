'use client'

import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import type {
  BtcVaultNavHistoryItem,
  BtcVaultNavHistorySortField,
} from '@/app/api/btc-vault/v1/nav-history/types'
import type { PaginationResponse } from '@/app/api/utils/types'
import { useStateSyncHealthCheck } from '@/app/collective-rewards/shared/hooks/useStateSyncHealthCheck'
import { getBtcVaultNavHistoryEndpoint } from '@/lib/endpoints'

const NAV_HISTORY_FETCH_LIMIT = 200

interface NavHistoryApiResponse {
  data: BtcVaultNavHistoryItem[]
  pagination: PaginationResponse & { totalPages?: number }
}

interface NavHistoryPageParams {
  page: number
  limit: number
  sortField: BtcVaultNavHistorySortField
  sortDirection: 'asc' | 'desc'
}

function buildNavHistoryUrl(params: NavHistoryPageParams): string {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(params.page))
  searchParams.set('limit', String(params.limit))
  searchParams.set('sort_field', params.sortField)
  searchParams.set('sort_direction', params.sortDirection)
  return `${getBtcVaultNavHistoryEndpoint}?${searchParams.toString()}`
}

export interface UseGetBtcNavHistoryParams {
  visibleItemCount: number
  sortField: BtcVaultNavHistorySortField
  sortDirection: 'asc' | 'desc'
}

export function useGetBtcNavHistory({
  visibleItemCount,
  sortField,
  sortDirection,
}: UseGetBtcNavHistoryParams) {
  const { isLoading: healthCheckIsLoading, error: healthCheckError } = useStateSyncHealthCheck()
  const pageCount = Math.max(1, Math.ceil(visibleItemCount / NAV_HISTORY_FETCH_LIMIT))
  const queriesEnabled = !healthCheckIsLoading

  const results = useQueries({
    queries: Array.from({ length: pageCount }, (_, i) => {
      const page = i + 1
      const limit = NAV_HISTORY_FETCH_LIMIT
      return {
        queryKey: ['btc-vault', 'nav-history', { page, limit, sortField, sortDirection }] as const,
        queryFn: async ({ signal }: { signal: AbortSignal }): Promise<NavHistoryApiResponse> => {
          const url = buildNavHistoryUrl({ page, limit, sortField, sortDirection })
          const res = await fetch(url, { cache: 'no-store', signal })
          if (!res.ok) {
            const text = await res.text()
            throw new Error(`NAV history API error: ${res.status} ${text}`)
          }
          return (await res.json()) as NavHistoryApiResponse
        },
        staleTime: 30_000,
        enabled: queriesEnabled,
      }
    }),
  })

  const resultsDataTick = results.map(r => r.dataUpdatedAt).join(',')

  const rows = useMemo(() => {
    const flat = results.flatMap(r => r.data?.data ?? [])
    return flat.slice(0, visibleItemCount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleItemCount, resultsDataTick])

  const pagination = results[0]?.data?.pagination
  const isLoading = healthCheckIsLoading || results.some(r => r.isLoading)
  const error = healthCheckError ?? results.find(r => r.error)?.error ?? null

  return {
    rows,
    pagination,
    isLoading,
    error,
  }
}
