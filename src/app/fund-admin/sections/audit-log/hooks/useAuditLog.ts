'use client'

import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { getBtcVaultAuditLogEndpoint } from '@/lib/endpoints'

import { AUDIT_LOG_FETCH_LIMIT } from '../constants'
import type {
  AuditLogApiResponse,
  AuditLogHistoryPageParams,
  UseGetAuditLogParams,
  UseGetAuditLogResult,
} from '../types'

function buildAuditLogUrl(params: AuditLogHistoryPageParams): string {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(params.page))
  searchParams.set('limit', String(params.limit))
  if (params.sortField && params.sortDirection) {
    searchParams.set('sort_field', params.sortField)
    searchParams.set('sort_direction', params.sortDirection)
  }
  return `${getBtcVaultAuditLogEndpoint}?${searchParams.toString()}`
}

/**
 * Audit log via GET /api/btc-vault/v1/audit-log (same pattern as `useGetBTCWhitelistingHistory`).
 */
export function useGetAuditLog({
  visibleItemCount,
  sortField,
  sortDirection,
}: UseGetAuditLogParams): UseGetAuditLogResult {
  const pageCount = Math.max(1, Math.ceil(visibleItemCount / AUDIT_LOG_FETCH_LIMIT))
  const sortKey = sortField && sortDirection ? `${sortField}:${sortDirection}` : 'natural'

  const results = useQueries({
    queries: Array.from({ length: pageCount }, (_, i) => {
      const page = i + 1
      const limit = AUDIT_LOG_FETCH_LIMIT
      return {
        queryKey: ['audit-log', { page, limit, sortKey }] as const,
        queryFn: async ({ signal }): Promise<AuditLogApiResponse> => {
          const url = buildAuditLogUrl({ page, limit, sortField, sortDirection })
          const res = await fetch(url, { cache: 'no-store', signal })
          if (!res.ok) {
            const text = await res.text()
            throw new Error(`Audit log API error: ${res.status} ${text}`)
          }
          return (await res.json()) as AuditLogApiResponse
        },
        staleTime: AVERAGE_BLOCKTIME,
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
    pagination,
    isLoading,
    error,
  }
}
