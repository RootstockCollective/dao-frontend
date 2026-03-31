'use client'

import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import type { FundAdminAuditLogSortField } from '@/app/api/fund-admin/v1/schemas'
import { AUDIT_LOG_PAGE_SIZE } from '@/app/fund-admin/sections/audit-log/constants'
import type { AuditLogEntry } from '@/app/fund-admin/sections/audit-log/types'
import { getFundAdminAuditLogEndpoint } from '@/lib/endpoints'

/** Max `limit` per request (matches GET /api/fund-admin/v1/audit-log). */
const AUDIT_LOG_FETCH_LIMIT = 200

interface AuditLogPagination {
  page: number
  limit: number
  offset: number
  total: number
  sort_field: string
  sort_direction: 'asc' | 'desc'
  totalPages?: number
}

interface AuditLogApiResponse {
  data: AuditLogEntry[]
  pagination: AuditLogPagination
}

interface AuditLogHistoryPageParams {
  page: number
  limit: number
  sortField?: FundAdminAuditLogSortField
  sortDirection?: 'asc' | 'desc'
}

function buildAuditLogUrl(params: AuditLogHistoryPageParams): string {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(params.page))
  searchParams.set('limit', String(params.limit))
  if (params.sortField !== undefined && params.sortDirection !== undefined) {
    searchParams.set('sort_field', params.sortField)
    searchParams.set('sort_direction', params.sortDirection)
  }
  return `${getFundAdminAuditLogEndpoint}?${searchParams.toString()}`
}

/** Prefix for React Query keys; use with `refetchQueries` / `invalidateQueries`. */
export const FUND_ADMIN_AUDIT_LOG_QUERY_KEY = ['fund-admin', 'audit-log'] as const

export type { AuditLogEntry, FundAdminAuditLogSortField }
export { AUDIT_LOG_PAGE_SIZE }

export interface UseGetAuditLogParams {
  /** Cumulative rows to show (expandable pager `end`). Fetches fixed-size API pages (max 200) and merges. */
  visibleItemCount: number
  sortField: FundAdminAuditLogSortField | null
  sortDirection: 'asc' | 'desc' | null
}

export interface UseGetAuditLogResult {
  entries: AuditLogEntry[]
  totalCount: number
  isLoading: boolean
  error: Error | null
  pagination: AuditLogPagination | undefined
}

/**
 * Fund admin audit log via GET /api/fund-admin/v1/audit-log (same pattern as `useGetBTCWhitelistingHistory`).
 */
export function useGetAuditLog({
  visibleItemCount,
  sortField,
  sortDirection,
}: UseGetAuditLogParams): UseGetAuditLogResult {
  const pageCount = Math.max(1, Math.ceil(visibleItemCount / AUDIT_LOG_FETCH_LIMIT))

  const sortKey = sortField !== null && sortDirection !== null ? `${sortField}:${sortDirection}` : 'natural'

  const results = useQueries({
    queries: Array.from({ length: pageCount }, (_, i) => {
      const page = i + 1
      const limit = AUDIT_LOG_FETCH_LIMIT
      return {
        queryKey: [...FUND_ADMIN_AUDIT_LOG_QUERY_KEY, { page, limit, sortKey }] as const,
        queryFn: async ({ signal }): Promise<AuditLogApiResponse> => {
          const url = buildAuditLogUrl({
            page,
            limit,
            sortField: sortField ?? undefined,
            sortDirection: sortDirection ?? undefined,
          })
          const res = await fetch(url, { cache: 'no-store', signal })
          if (!res.ok) {
            const text = await res.text()
            throw new Error(`Fund admin audit log API error: ${res.status} ${text}`)
          }
          return (await res.json()) as AuditLogApiResponse
        },
        staleTime: 30_000,
      }
    }),
  })

  const resultsDataTick = results.map(r => r.dataUpdatedAt).join(',')

  const entries = useMemo(() => {
    const flat = results.flatMap(r => r.data?.data ?? [])
    return flat.slice(0, visibleItemCount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleItemCount, resultsDataTick])

  const pagination = results[0]?.data?.pagination
  const isLoading = results.some(r => r.isLoading)
  const error = results.find(r => r.error)?.error ?? null

  return {
    entries,
    totalCount: pagination?.total ?? 0,
    isLoading,
    error,
    pagination,
  }
}
