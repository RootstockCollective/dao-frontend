'use client'

import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import type {
  BtcVaultWhitelistedUserItem,
  BtcVaultWhitelistedUsersSortField,
} from '@/app/api/btc-vault/v1/whitelist-role-history/action'
import { useStateSyncHealthCheck } from '@/app/collective-rewards/shared/hooks/useStateSyncHealthCheck'
import { getBtcVaultWhitelistRoleHistoryEndpoint } from '@/lib/endpoints'

/** Max `limit` allowed by the whitelist history API. */
const WHITELIST_HISTORY_FETCH_LIMIT = 200

interface WhitelistRoleHistoryPagination {
  page: number
  limit: number
  offset: number
  total: number
  sort_field: string
  sort_direction: 'asc' | 'desc'
  totalPages?: number
}

interface WhitelistRoleHistoryApiResponse {
  data: BtcVaultWhitelistedUserItem[]
  pagination: WhitelistRoleHistoryPagination
}

interface WhitelistHistoryPageParams {
  page: number
  limit: number
  sortField: BtcVaultWhitelistedUsersSortField
  sortDirection: 'asc' | 'desc'
}

function buildWhitelistHistoryUrl(params: WhitelistHistoryPageParams): string {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(params.page))
  searchParams.set('limit', String(params.limit))
  searchParams.set('sort_field', params.sortField)
  searchParams.set('sort_direction', params.sortDirection)
  return `${getBtcVaultWhitelistRoleHistoryEndpoint}?${searchParams.toString()}`
}

/** Prefix for React Query keys; use with `refetchQueries` / `invalidateQueries` for all whitelist pages. */
export const BTC_VAULT_WHITELISTED_USERS_QUERY_KEY = ['btc-vault', 'whitelisted-users'] as const

export interface UseGetBTCWhitelistingHistoryParams {
  /** Cumulative rows to show (expandable pager `end`). Fetches fixed-size API pages (max 200) and merges. */
  visibleItemCount: number
  sortField: BtcVaultWhitelistedUsersSortField
  sortDirection: 'asc' | 'desc'
}

/**
 * Fetches whitelist rows from `GET /api/btc-vault/v1/whitelist-role-history` (server prefers state-sync DB, falls back to subgraph).
 * Waits for {@link useStateSyncHealthCheck} to finish loading before running queries (same UX as my-rewards RBI).
 */
export function useGetBTCWhitelistingHistory({
  visibleItemCount,
  sortField,
  sortDirection,
}: UseGetBTCWhitelistingHistoryParams) {
  const { isLoading: healthCheckIsLoading, error: healthCheckError } = useStateSyncHealthCheck()

  const pageCount = Math.max(1, Math.ceil(visibleItemCount / WHITELIST_HISTORY_FETCH_LIMIT))
  const queriesEnabled = !healthCheckIsLoading

  const results = useQueries({
    queries: Array.from({ length: pageCount }, (_, i) => {
      const page = i + 1
      const limit = WHITELIST_HISTORY_FETCH_LIMIT
      return {
        queryKey: [
          ...BTC_VAULT_WHITELISTED_USERS_QUERY_KEY,
          { page, limit, sortField, sortDirection },
        ] as const,
        queryFn: async ({ signal }): Promise<WhitelistRoleHistoryApiResponse> => {
          const url = buildWhitelistHistoryUrl({ page, limit, sortField, sortDirection })
          const res = await fetch(url, { cache: 'no-store', signal })
          if (!res.ok) {
            const text = await res.text()
            throw new Error(`Whitelist history API error: ${res.status} ${text}`)
          }
          return (await res.json()) as WhitelistRoleHistoryApiResponse
        },
        staleTime: 30_000,
        enabled: queriesEnabled,
      }
    }),
  })

  // `results` from useQueries is a new array each render; key off query staleness so merged `rows` is stable.
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
