'use client'

import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'

import { AUDIT_LOG_FETCH_LIMIT } from '../constants'
import type { AuditLogApiResponse, UseGetAuditLogParams, UseGetAuditLogResult } from '../types'
import { buildAuditLogUrl } from '../utils'

/**
 * Audit log via GET /api/btc-vault/v1/audit-log (same pattern as `useGetBTCWhitelistingHistory`).
 */
export function useGetAuditLog({
  visibleItemCount,
  sortField,
  sortDirection,
  filters,
  isEnabled = true,
}: UseGetAuditLogParams): UseGetAuditLogResult {
  const pageCount = Math.max(1, Math.ceil(visibleItemCount / AUDIT_LOG_FETCH_LIMIT))
  const sortKey = sortField && sortDirection ? `${sortField}:${sortDirection}` : 'natural'
  const filterKey = JSON.stringify(filters ?? {})

  const results = useQueries({
    queries: Array.from({ length: pageCount }, (_, i) => {
      const page = i + 1
      const limit = AUDIT_LOG_FETCH_LIMIT
      return {
        queryKey: ['audit-log', { page, limit, sortKey, filterKey }] as const,
        enabled: isEnabled,
        queryFn: async ({ signal }): Promise<AuditLogApiResponse> => {
          const url = buildAuditLogUrl({ page, limit, sortField, sortDirection, filters })
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
  const isLoading = results.some(r => r.isLoading || r.isFetching)
  const error = results.find(r => r.error)?.error ?? null

  return {
    entries,
    pagination,
    isLoading,
    error,
  }
}
